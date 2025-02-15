import { useQuery } from "@tanstack/react-query";
import { getUomById, getUoms } from "../actions/umoActions";

export const useUoms = () => {
  return useQuery({
    queryKey: ["uoms"],
    queryFn: () => getUoms(),
  });
};

export const useUmoById = (id: string) => {
  return useQuery({
    queryKey: ["uom-by-id", id],
    queryFn: () => getUomById(id),
  });
};
