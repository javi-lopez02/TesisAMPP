// prisma/seed.ts
import { Rol } from "../src/generated/prisma/enums";
import { prisma } from "../src/config/prisma";
import { hash } from "bcryptjs";

async function main() {
  console.log("🌱 Iniciando seed de datos iniciales...\n");

  // ========================================================================
  // 1. ASAMBLEA MUNICIPAL
  // ========================================================================
  const codigoAsamblea = "AMP-001";
  const asambleaExistente = await prisma.asambleaMunicipal.findUnique({
    where: { codigo: codigoAsamblea },
  });

  if (!asambleaExistente) {
    await prisma.asambleaMunicipal.create({
      data: {
        nombre: "Asamblea Municipal del Poder Popular Union de Reyes",
        codigo: codigoAsamblea,
        servicentroNombre: "Servicentro Central Municipal",
        servicentroDireccion: "Calle Principal #100, Centro de la Ciudad",
        activo: true,
      },
    });
    console.log("✅ Asamblea Municipal creada exitosamente.");
  } else {
    console.log("ℹ️ La Asamblea Municipal ya existe. Saltando...");
  }

  // ========================================================================
  // 2. USUARIO ADMINISTRADOR
  // ========================================================================
  const adminCorreo = "admin@ampp.gob.cu";
  const adminExistente = await prisma.usuario.findUnique({
    where: { correo: adminCorreo },
  });

  if (!adminExistente) {
    // Hash seguro (12 salt rounds)
    const contraseniaHash = await hash("Admin.2026", 12);

    await prisma.usuario.create({
      data: {
        correo: adminCorreo,
        contrasenia: contraseniaHash,
        nombre: "Administrador",
        apellidos: "General del Sistema",
        rol: Rol.ADMINISTRADOR,
        activo: true,
      },
    });
    console.log("✅ Usuario Administrador creado exitosamente.");
    console.log("🔑 Credenciales iniciales:");
    console.log("   📧 admin@ampp.gob.cu");
    console.log("   🔒 Admin.2026  ← ⚠️ Cambiar tras primer login");
  } else {
    console.log("ℹ️ El Usuario Administrador ya existe. Saltando...");
  }

  console.log("\n🎉 Seed completado. Base de datos lista para desarrollo.");
}

main()
  .catch((e) => {
    console.error("\n❌ Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
