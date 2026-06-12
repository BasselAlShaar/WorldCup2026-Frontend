"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export function usePolling(fetchFn, interval = 30000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetchFnRef = useRef(fetchFn);

  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const result = await fetchFnRef.current();
        if (!cancelled) setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    // Defer first call to next microtask, avoids synchronous setState in effect
    const timeout = setTimeout(run, 0);
    const timer = setInterval(run, interval);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, [interval]); // fetchFn accessed via ref, so no dependency needed

  return { data, loading };
}