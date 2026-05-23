"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = "https://api-places-colombia.herokuapp.com";

/**
 * Hook para cargar departamentos y ciudades de Colombia desde la API externa.
 * - Se cargan todos los departamentos al montar el componente.
 * - Al seleccionar un departamento, se actualizan las ciudades automáticamente.
 * - Maneja errores de red y provee un fallback para entrada manual.
 *
 * @returns {{ departments: string[], cities: string[], selectedDept: string, setSelectedDept: (dept: string) => void, loading: boolean, error: string | null }}
 */
export function useColombiaPlaces() {
  const [departments, setDepartments] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch de todos los departamentos al montar
  useEffect(() => {
    let cancelled = false;

    async function fetchDepartments() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/`);

        if (!res.ok) {
          throw new Error(`Error HTTP ${res.status}`);
        }

        const data = await res.json();
        if (cancelled) return;

        // La API devuelve un array de { department: string, cities: string[] }
        if (Array.isArray(data)) {
          setDepartments(data);
        } else {
          throw new Error("Formato de respuesta inesperado");
        }
      } catch (err) {
        if (!cancelled) {
          console.warn("[useColombiaPlaces] Error al cargar departamentos:", err.message);
          setError(err.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDepartments();
    return () => { cancelled = true; };
  }, []);

  // Cuando cambia selectedDept, actualizar las ciudades
  useEffect(() => {
    if (!selectedDept) {
      setCities([]);
      return;
    }

    const dept = departments.find(
      (d) => d.department?.toLowerCase() === selectedDept.toLowerCase()
    );
    setCities(dept?.cities || []);
  }, [selectedDept, departments]);

  // Wrapper de setSelectedDept que también limpia cities si cambia
  const handleSetSelectedDept = useCallback((dept) => {
    setSelectedDept(dept);
  }, []);

  return {
    departments: departments.map((d) => d.department).filter(Boolean),
    cities,
    selectedDept,
    setSelectedDept: handleSetSelectedDept,
    loading,
    error,
  };
}
