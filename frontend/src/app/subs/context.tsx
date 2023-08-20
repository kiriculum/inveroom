"use client";

import { createContext, useContext, useState } from "react";
import useSWRImmutable from "swr/immutable";
import {
  ClientAPIRequest,
  LayoutProps,
  SubsGameContextType,
  getSubStateType,
  postSubNewType,
  postSubNextPrevType,
  postSubSubmitType,
} from "types";
import { useClient } from "../../../(auth)/context";

export const SubsContext = createContext<SubsGameContextType | null>(null);

export function SubsProvider({ children }: LayoutProps) {
  const [subsError, setSubsError] = useState<any>(null);
  const { useClientAPI } = useClient();

  function useCatcher<IN extends Record<string, any> | void, OUT>(
    func: ClientAPIRequest<IN, OUT>
  ) {
    return async (input: any) => {
      try {
        return await func(input);
      } catch (err) {
        setSubsError(err);
      }
    };
  }

  const getState: getSubStateType = useClientAPI("subs/state/", "GET");
  const postSubmit: postSubSubmitType = useCatcher(
    useClientAPI("subs/submit/", "POST")
  );
  const postNext: postSubNextPrevType = useCatcher(
    useClientAPI("subs/next/", "POST")
  );
  const postPrev: postSubNewType = useCatcher(
    useClientAPI("subs/prev/", "POST")
  );
  const postNew: postSubNewType = useCatcher(
    useClientAPI("subs/new/", "POST")
  );

  const { data, isLoading, mutate } = useSWRImmutable(
    "substask",
    async () => {
      const [res] = await Promise.all([
        getState(),
        new Promise((resolve) => {
          // add 1 sec throttle to negate UI blinks
          setTimeout(resolve, 1000);
        }),
      ]);
      return res;
    },
    {
      onError: (err) => {
        setSubsError(err);
      },
      onSuccess: () => setSubsError(null),
    }
  );

  return (
    <SubsContext.Provider
      value={{
        data,
        isLoading,
        subsError,
        mutate,
        getState,
        postSubmit,
        postNext,
        postPrev,
        postNew,
      }}
    >
      {children}
    </SubsContext.Provider>
  );
}

export function useSubsGame() {
  return useContext(SubsContext) as SubsGameContextType;
}
