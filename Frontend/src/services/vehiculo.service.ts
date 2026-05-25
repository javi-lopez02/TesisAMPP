import axios from "./axios.service";

export interface GetVehiculosParams {
  asambleaId?: string;
  tipoCombustibleId?: string;
  estado?: string;
  choferId?: string;
  busqueda?: string;
  activo?: boolean;
}

export const getVehiculosRequest = (params?: GetVehiculosParams) => {
  const qs = new URLSearchParams();
  if (params?.asambleaId) qs.append("asambleaId", params.asambleaId);
  if (params?.tipoCombustibleId)
    qs.append("tipoCombustibleId", params.tipoCombustibleId);
  if (params?.estado) qs.append("estado", params.estado);
  if (params?.choferId) qs.append("choferId", params.choferId);
  if (params?.busqueda) qs.append("busqueda", params.busqueda);
  if (params?.activo !== undefined) qs.append("activo", String(params.activo));
  
  return axios.get(`/vehiculo${qs.toString() ? `?${qs}` : ""}`);
};