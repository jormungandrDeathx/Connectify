import { useCallback, useRef } from "react";

function useInfiniteScroll(callBack, isLoading, hasMore) {
  let observeRef = useRef(null);

  let lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;

      if (observeRef.current) observeRef.current.disconnect();

      observeRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            callBack();
          }
        },
        { threshold: 0.5 }
      );
      if (node) observeRef.current.observe(node);
    },
    [isLoading, hasMore, callBack]
  );
  return lastElementRef;
}

export default useInfiniteScroll;
