import { Rol } from "../src/generated/prisma/enums";
import { prisma } from "../src/config/prisma";
import { hash } from "bcryptjs";
import { error } from "node:console";

interface IUser {
  correo: string;
  contrasenia: string;
  nombre: string;
  apellidos: string;
  rol: Rol;
  activo: boolean;
}

interface IConsejo {
  nombre: string;
  codigo: string;
  presidenteId: string;
}

interface ICircunc {
  nombre: string;
  codigo: string;
  delegadoId: string;
  consejoPopularId: string;
}

interface IZona {
  nombre: string;
  codigo: string;
  circunscripcionId: string;
}

interface ICdr {
  numero: string;
  direccion: string;
  zonaId: string;
}

async function main() {
  console.log("🌱 Iniciando seed de datos de usuarios...\n");

  const User: IUser[] = [
    //PRESIDENTES DE CONSEJO
    {
      correo: "presidente.union@ampp.gob.cu",
      contrasenia: "Presidente.2026",
      nombre: "Presidente",
      apellidos: "Union de Reyes",
      rol: Rol.PRESIDENTE_CONSEJO,
      activo: true,
    },
    {
      correo: "presidente.alacranes@ampp.gob.cu",
      contrasenia: "Presidente.2026",
      nombre: "Presidente",
      apellidos: "Alacranes",
      rol: Rol.PRESIDENTE_CONSEJO,
      activo: true,
    },
    {
      correo: "presidente.bermejas@ampp.gob.cu",
      contrasenia: "Presidente.2026",
      nombre: "Presidente",
      apellidos: "Bermejas",
      rol: Rol.PRESIDENTE_CONSEJO,
      activo: true,
    },
    {
      correo: "presidente.cabezas@ampp.gob.cu",
      contrasenia: "Presidente.2026",
      nombre: "Presidente",
      apellidos: "Cabezas",
      rol: Rol.PRESIDENTE_CONSEJO,
      activo: true,
    },
    {
      correo: "presidente.sabanilla@ampp.gob.cu",
      contrasenia: "Presidente.2026",
      nombre: "Presidente",
      apellidos: "Sabanilla",
      rol: Rol.PRESIDENTE_CONSEJO,
      activo: true,
    },
    {
      correo: "presidente.cidra@ampp.gob.cu",
      contrasenia: "Presidente.2026",
      nombre: "Presidente",
      apellidos: "Cidra",
      rol: Rol.PRESIDENTE_CONSEJO,
      activo: true,
    },

    //DELEGADOS
    {
      correo: "delegado.union@ampp.gob.cu",
      contrasenia: "Delegado.2026",
      nombre: "Delegado",
      apellidos: "Circuns 1 Union",
      rol: Rol.DELEGADO,
      activo: true,
    },
    {
      correo: "delegado.alacranes@ampp.gob.cu",
      contrasenia: "Delegado.2026",
      nombre: "Delegado",
      apellidos: "Circuns 1 Alacranes",
      rol: Rol.DELEGADO,
      activo: true,
    },
    {
      correo: "delegado.bermejas@ampp.gob.cu",
      contrasenia: "Delegado.2026",
      nombre: "Delegado",
      apellidos: "Circuns 1 Bermejas",
      rol: Rol.DELEGADO,
      activo: true,
    },
    {
      correo: "delegado.cabezas@ampp.gob.cu",
      contrasenia: "Delegado.2026",
      nombre: "Delegado",
      apellidos: "Circuns 1 Cabezas",
      rol: Rol.DELEGADO,
      activo: true,
    },
    {
      correo: "delegado.sabanilla@ampp.gob.cu",
      contrasenia: "Delegado.2026",
      nombre: "Delegado",
      apellidos: "Circuns 1 Sabanilla",
      rol: Rol.DELEGADO,
      activo: true,
    },
    {
      correo: "delegado.cidra@ampp.gob.cu",
      contrasenia: "Delegado.2026",
      nombre: "Delegado",
      apellidos: "Circuns 1 Cidra",
      rol: Rol.DELEGADO,
      activo: true,
    },
  ];

  const userMap: Record<string, string> = {};

  for (const key in User) {
    const element = User[key];

    const user = await prisma.usuario.findUnique({
      where: { correo: element.correo },
    });

    if (!user) {
      const pass = await hash(element.contrasenia, 12);

      const newUser = await prisma.usuario.create({
        data: {
          ...element,
          contrasenia: pass,
        },
      });
      userMap[newUser.apellidos] = newUser.id;
    } else {
      throw error(`Ya existe un usuario con el corre0 ${element.correo}`);
    }
  }

  const consejo: IConsejo[] = [
    {
      nombre: "Alacranes",
      codigo: "ALA-123",
      presidenteId: userMap["Alacranes"],
    },
    {
      nombre: "Union de Reyes",
      codigo: "UDR-123",
      presidenteId: userMap["Union de Reyes"],
    },
    {
      nombre: "Bermejas",
      codigo: "BER-123",
      presidenteId: userMap["Bermejas"],
    },
    {
      nombre: "Cabezas",
      codigo: "CAB-123",
      presidenteId: userMap["Cabezas"],
    },
    {
      nombre: "Sabanilla",
      codigo: "SAB-123",
      presidenteId: userMap["Sabanilla"],
    },
    {
      nombre: "Cidra",
      codigo: "CID-123",
      presidenteId: userMap["Cidra"],
    },
  ];

  const consejoMap: Record<string, string> = {};

  for (const key in consejo) {
    const element = consejo[key];

    const findConsejo = await prisma.consejoPopular.findUnique({
      where: { codigo: element.codigo },
    });

    if (!findConsejo) {
      const newConsejo = await prisma.consejoPopular.create({
        data: element,
      });

      consejoMap[newConsejo.codigo] = newConsejo.id;
    } else {
      throw error("Ya existe un consejo popular con ese codigo");
    }
  }

  const circuns: ICircunc[] = [
    {
      nombre: "Circuns 1 Alacranes",
      codigo: "C-123",
      delegadoId: userMap["Circuns 1 Alacranes"],
      consejoPopularId: consejoMap["ALA-123"],
    },
    {
      nombre: "Circuns 1 Bermejas",
      codigo: "C-124",
      delegadoId: userMap["Circuns 1 Bermejas"],
      consejoPopularId: consejoMap["BER-123"],
    },
    {
      nombre: "Circuns 1 Cabezas",
      codigo: "C-125",
      delegadoId: userMap["Circuns 1 Cabezas"],
      consejoPopularId: consejoMap["CAB-123"],
    },
    {
      nombre: "Circuns 1 Sabanilla",
      codigo: "C-126",
      delegadoId: userMap["Circuns 1 Sabanilla"],
      consejoPopularId: consejoMap["SAB-123"],
    },
    {
      nombre: "Circuns 1 Union",
      codigo: "C-127",
      delegadoId: userMap["Circuns 1 Union"],
      consejoPopularId: consejoMap["UDR-123"],
    },
    {
      nombre: "Circuns 1 Cidra",
      codigo: "C-128",
      delegadoId: userMap["Circuns 1 Cidra"],
      consejoPopularId: consejoMap["CID-123"],
    },
  ];

  const circunsMap: Record<string, string> = {};

  for (const key in circuns) {
    const element = circuns[key];

    const findCircuns = await prisma.circunscripcion.findUnique({
      where: { codigo: element.codigo },
    });

    if (!findCircuns) {
      const newCircuns = await prisma.circunscripcion.create({
        data: element,
      });

      circunsMap[newCircuns.codigo] = newCircuns.id;
    } else {
      throw error("Ya existe una circunscripcion con ese codigo");
    }
  }

  const zonas: IZona[] = [
    {
      nombre: "Zona 1 Alacranes",
      codigo: "Z-123",
      circunscripcionId: circunsMap["C-123"],
    },
    {
      nombre: "Zona 1 Bermejas",
      codigo: "Z-124",
      circunscripcionId: circunsMap["C-124"],
    },
    {
      nombre: "Zona 1 Cabezas",
      codigo: "Z-125",
      circunscripcionId: circunsMap["C-125"],
    },
    {
      nombre: "Zona 1 Sabanilla",
      codigo: "Z-126",
      circunscripcionId: circunsMap["C-126"],
    },
    {
      nombre: "Zona 1 Union",
      codigo: "Z-127",
      circunscripcionId: circunsMap["C-127"],
    },
    {
      nombre: "Zona 1 Cidra",
      codigo: "Z-128",
      circunscripcionId: circunsMap["C-128"],
    },
  ];

  const zonasMap: Record<string, string> = {};

  for (const key in zonas) {
    const element = zonas[key];

    const findZona = await prisma.zona.findUnique({
      where: { codigo: element.codigo },
    });

    if (!findZona) {
      const newZona = await prisma.zona.create({
        data: element,
      });

      zonasMap[newZona.codigo] = newZona.id;
    } else {
      throw error("Ya existe una zona con ese codigo");
    }
  }

  const cdrs: ICdr[] = [
    {
      numero: "1",
      direccion: "Z-123",
      zonaId: zonasMap["Z-123"],
    },
    {
      numero: "2",
      direccion: "Z-124",
      zonaId: zonasMap["Z-124"],
    },
    {
      numero: "3",
      direccion: "Z-125",
      zonaId: zonasMap["Z-125"],
    },
    {
      numero: "4",
      direccion: "Z-126",
      zonaId: zonasMap["Z-126"],
    },
    {
      numero: "5",
      direccion: "Z-127",
      zonaId: zonasMap["Z-127"],
    },
    {
      numero: "6",
      direccion: "Z-128",
      zonaId: zonasMap["Z-128"],
    },
  ];

  for (const key in cdrs) {
    const element = cdrs[key];

    const findCdr = await prisma.cDR.findUnique({
      where: { numero: element.numero },
    });

    if (!findCdr) {
      await prisma.cDR.create({
        data: element,
      });
    } else {
      throw error("Ya existe un cdr con ese codigo");
    }
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
