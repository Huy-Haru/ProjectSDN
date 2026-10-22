import { useCallback, useEffect, useState } from "react";
// Keyed results and cleanup prevent a slower old filter request replacing the current one.
export function useApiResource(load, key) {
  const [state, setState] = useState({
    key: null,
    data: [],
    loading: true,
    error: "",
  });
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    load()
      .then((data) => {
        if (active) setState({ key, data, loading: false, error: "" });
      })
      .catch((error) => {
        if (active)
          setState({
            key,
            data: [],
            loading: false,
            error: error.message || "Không thể tải dữ liệu.",
          });
      });
    return () => {
      active = false;
    };
  }, [load, key, revision]);
  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    setRevision((n) => n + 1);
  }, []);
  return {
    data: state.key === key ? state.data : [],
    loading: state.loading || state.key !== key,
    error: state.key === key ? state.error : "",
    reload,
  };
}
