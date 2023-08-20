"use client";

import { LayoutProps } from "types";
import { useSubsGame } from "./context";

function NoGame() {
  const { mutate, postNew } = useSubsGame();
  (async function () {
    await postNew();
    await mutate();
  })();
  return <div>Starting a new game...</div>;
}

function SubsGame() {
  const { data, postNew, mutate } = useSubsGame();
  if (!data) return <></>;

  const newGame = async () => {
    await postNew();
    mutate();
  };

  const options = data.options.map((option, key) => (
    <SubsOption key={key} index={key}>
      {option}
    </SubsOption>
  ));

  return (
    <div className="grid w-full gap-4 md:w-96">
      <div className="relative text-xl">
        Subtitle game - task {data.index + 1} of {data.total}
        <div className="absolute right-4 top-0 text-base">
          <button className="reloadIcon peer"></button>
          <div className="absolute right-6 hidden w-32 rounded-lg bg-slate-100 p-3 ring-1 active:grid peer-focus:grid dark:bg-slate-800">
            <div>Start a new game?</div>
            <button className="btn mt-2" onClick={newGame}>
              Yes
            </button>
          </div>
        </div>
      </div>
      <div className="grid overflow-hidden rounded-lg text-center ring-1">
        <div className="sub">{data.up_sub}</div>
        <div className="main-sub">{data.main_sub}</div>
        <div className="sub">{data.down_sub}</div>
      </div>
      <div>Definition: {data.definition}</div>
      <div className="grid grid-cols-2 gap-4">{options}</div>
      <div className="mt-4 grid">
        <SubsSubmitBtn />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SubsPrevBtn />
        <SubsNextBtn />
      </div>
    </div>
  );
}

function SubsPrevBtn() {
  const { data, mutate, postPrev } = useSubsGame();
  if (!data) return <></>;
  const disabled = data.index <= 0;

  const prev = async () => {
    if (!disabled) {
      const res = await postPrev();
      res && mutate(res, { revalidate: false });
    }
  };
  return (
    <button className="btn" disabled={disabled} onClick={prev}>
      Previous
    </button>
  );
}

function SubsNextBtn() {
  const { data, mutate, postNext, postNew } = useSubsGame();
  if (!data) return <></>;
  const disabled = data.answer === null;
  const isNew = data.index >= data.total - 1;

  const next = async () => {
    if (!disabled) {
      if (isNew) {
        await postNew();
        mutate();
      } else {
        const res = await postNext();
        res && mutate(res, { revalidate: false });
      }
    }
  };
  return (
    <button className="btn" disabled={disabled} onClick={next}>
      {isNew ? "New" : "Next"}
    </button>
  );
}

function SubsSubmitBtn() {
  const { data, mutate, postSubmit } = useSubsGame();
  if (!data) return <></>;
  const disabled = data.submitted === null || data.answer !== null;

  const submitAnswer = async () => {
    if (data.submitted !== null) {
      const res = await postSubmit({ submitted: data.submitted });
      res && mutate(res, { revalidate: false });
    }
  };

  return (
    <button className="btn w-full" disabled={disabled} onClick={submitAnswer}>
      Submit answer
    </button>
  );
}

function SubsOption({ index, children }: { index: number } & LayoutProps) {
  const { data, mutate } = useSubsGame();
  if (!data) return <></>;
  const { submitted, answer } = data;

  const submit = async () => {
    if (data.answer !== null) return;
    const newTask = data ? { ...data, submitted: index } : data;
    mutate(newTask, { revalidate: false });
  };

  const styles = `btn ${
    answer !== null
      ? answer === index
        ? "positive"
        : submitted === index && "danger"
      : submitted === index && "selected"
  }`;
  return (
    <button className={styles} onClick={submit}>
      {children}
    </button>
  );
}

export default function SubsPage() {
  const { data, isLoading, subsError, mutate, postNew } = useSubsGame();
  if (isLoading) return <div>Loading...</div>;
  if (subsError) return <div>Failed fetching data...</div>;
  if (!data) return <NoGame />;

  return <SubsGame />;
}
