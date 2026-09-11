"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WardGame from "./ward";

export default function PlayCase() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [exitTo, setExitTo] = useState(false);

  if (exitTo) {
    if (typeof window !== "undefined") router.push("/play");
    return null;
  }

  return (
    <>
      <div className="header-bar">
        <div className="logo">Nephro<span>Quest</span></div>
        <div>
          <a href="/" className="small" style={{ marginRight: 14 }}>Menu</a>
          <a href="/play" className="small">Cases</a>
        </div>
      </div>
      <WardGame caseId={id || ""} onExit={() => setExitTo(true)} />
    </>
  );
}
