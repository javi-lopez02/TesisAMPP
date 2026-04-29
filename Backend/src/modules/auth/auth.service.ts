import { prisma } from "../../config/prisma";
import { hashPassword, verifyPassword } from "../../utils/password";
import { generateTokens, verifyToken, JwtPayload } from "../../utils/jwt";
import { Rol } from "../../generated/prisma/enums";
import { RegisterInput, LoginInput } from "./auth.dto";

export const AuthService = {
  async register(data: RegisterInput) {
    // Verificar si el correo ya existe
    const existing = await prisma.usuario.findUnique({
      where: { correo: data.correo },
    });
    if (existing) {
      throw new Error("El correo ya está registrado");
    }

    // Hash de contraseña
    const contraseniaHash = await hashPassword(data.contrasenia);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        correo: data.correo,
        contrasenia: contraseniaHash,
        nombre: data.nombre,
        apellidos: data.apellidos,
        rol: data.rol || Rol.DELEGADO,
      },
      select: {
        id: true,
        correo: true,
        nombre: true,
        apellidos: true,
        rol: true,
        activo: true,
        createdAt: true,
      },
    });

    return {
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        rol: usuario.rol,
        activo: usuario.activo,
        createdAt: usuario.createdAt,
      },
    };
  },

  async login({ correo, contrasenia }: LoginInput) {
    // Buscar usuario con correo
    const usuario = await prisma.usuario.findUnique({
      where: { correo },
      include: {
        consejoPopularPresidente: {
          select: { id: true, nombre: true, codigo: true },
        },
        circunscripcionDelegado: {
          select: { id: true, nombre: true, codigo: true },
        },
      },
    });

    if (!usuario || !usuario.activo) {
      throw new Error("Credenciales inválidas");
    }

    // Verificar contraseña
    const validPassword = await verifyPassword(
      contrasenia,
      usuario.contrasenia,
    );
    if (!validPassword) {
      throw new Error("Credenciales inválidas");
    }

    // Retornar datos sin contraseña
    const { contrasenia: _, ...usuarioSinPass } = usuario;

    return { usuario: usuarioSinPass };
  },

  async refreshToken(token: string) {
    const payload = verifyToken(token);
    if (!payload) {
      throw new Error("Token inválido o expirado");
    }

    // Verificar que el usuario aún exista y esté activo
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.sub },
      select: { id: true, correo: true, rol: true, activo: true },
    });

    if (!usuario || !usuario.activo) {
      throw new Error("Usuario no encontrado o inactivo");
    }

    // Generar nuevos tokens
    const jwtPayload: JwtPayload = {
      sub: usuario.id,
      correo: usuario.correo,
      rol: usuario.rol,
    };

    return generateTokens(jwtPayload);
  },
};
