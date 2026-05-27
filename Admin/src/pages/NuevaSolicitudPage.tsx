import { useState, useCallback, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSolicitudes } from "../hooks/useSolicitud";
import { useTipoCombustible } from "../hooks/useTipoCombustible";
import { useConsejoPopular } from "../hooks/useConsejoPopular";
import { useCircunscripciones } from "../hooks/useCircunscripciones";
import { useZonas } from "../hooks/useZonas";
import { useCdr } from "../hooks/useCdr";
import { SolicitudForm } from "../components/solicitud/SolicitudForm";
import {
  validateSolicitudForm,
  resetSolicitudForm,
  resetPuntoRuta,
} from "../schemas/solicitud.schema";
import type {
  FormState,
  FormPuntoRuta,
  createSolicitud,
} from "../types/solicitud.types";

export const NuevaSolicitudPage = () => {
  const navigate = useNavigate();
  const { create, loading: loadingSubmit } = useSolicitudes();
  const { tipoCombustible: tiposCombustible, getAll: getAllTipos } =
    useTipoCombustible();
  const { consejosPopulares: consejos, getAll: getAllConsejos } =
    useConsejoPopular();
  const { circunscripciones, getAll: getAllCircunscripciones } =
    useCircunscripciones();
  const { zonas, getAll: getAllZonas } = useZonas();
  const { cdrs, getAll: getAllCdrs } = useCdr();

  const [form, setForm] = useState<FormState>(resetSolicitudForm());
  const [formErrors, setFormErrors] = useState<
    Partial<
      Record<keyof FormState, string> & {
        puntosRuta?: Record<
          number,
          Partial<Record<keyof FormPuntoRuta, string>>
        >;
      }
    >
  >({});
  const [loadingData, setLoadingData] = useState(true);

  // Cargar datos al montar
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        getAllTipos(),
        getAllConsejos(),
        getAllCircunscripciones(),
        getAllZonas(),
        getAllCdrs(),
      ]);
      setLoadingData(false);
    };
    loadData();
  }, [
    getAllCdrs,
    getAllCircunscripciones,
    getAllConsejos,
    getAllTipos,
    getAllZonas,
  ]);

  // Handlers principales
  const handleChange = useCallback((partial: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleAddPunto = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      puntosRuta: [
        ...prev.puntosRuta,
        { ...resetPuntoRuta(), orden: String(prev.puntosRuta.length) },
      ],
    }));
  }, []);

  const handleRemovePunto = useCallback((index: number) => {
    setForm((prev) => ({
      ...prev,
      puntosRuta: prev.puntosRuta
        .filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, orden: String(i) })),
    }));
  }, []);

  const handleUpdatePunto = useCallback(
    (index: number, partial: Partial<FormPuntoRuta>) => {
      setForm((prev) => ({
        ...prev,
        puntosRuta: prev.puntosRuta.map((p, i) =>
          i === index ? { ...p, ...partial } : p,
        ),
      }));
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    // Preparar datos para validación
    const payload = {
      ...form,
      cantidadLitros: Number(form.cantidadLitros),
      distanciaTotal: Number(form.distanciaTotal),
      tiempoEstimado: Number(form.tiempoEstimado),
      puntosRuta: form.puntosRuta.map((p) => ({
        ...p,
        orden: Number(p.orden),
      })),
    };

    // Validar
    const result = validateSolicitudForm(payload);
    setFormErrors(result.errors);

    if (!result.isValid) {
      const firstError = document.querySelector("[class*='text-[#CC1A2E]']");
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Enviar al backend
    await create(payload as unknown as createSolicitud);
    navigate("/solicitudes");
  }, [form, create, navigate]);

  const handleCancel = useCallback(() => {
    navigate("/solicitudes");
  }, [navigate]);

  // Loading state
  if (loadingData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-white/30">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1B3D8F] border-t-transparent" />
          <p className="text-[13px] font-semibold">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-['Sora',sans-serif]">
      {/* Header con volver */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={handleCancel}
          className="flex items-center gap-1.5 rounded-lg border border-black/8 bg-white px-3 py-2 text-[12px] font-semibold text-gray-500 transition hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10"
        >
          <ArrowLeft size={14} /> Volver
        </button>
        <h1 className="text-[18px] font-bold text-[#0e1f4d] dark:text-white">
          Nueva Solicitud
        </h1>
      </div>

      {/* Formulario */}
      <SolicitudForm
        form={form}
        tiposCombustible={tiposCombustible}
        consejos={consejos}
        circunscripciones={circunscripciones}
        zonas={zonas}
        cdrs={cdrs}
        errors={formErrors}
        loading={loadingSubmit}
        onChange={handleChange}
        onAddPunto={handleAddPunto}
        onRemovePunto={handleRemovePunto}
        onUpdatePunto={handleUpdatePunto}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
};
