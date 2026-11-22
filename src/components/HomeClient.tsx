"use client";

import { useState } from "react";
import type { DepartmentId } from "@/config/departments";
import { WorkspaceDemo } from "./WorkspaceDemo";
import { IndustryTemplates } from "./IndustryTemplates";

export function HomeClient() {
  const [activeDepartmentId, setActiveDepartmentId] = useState<DepartmentId>("tiktok-shop");

  return (
    <>
      <WorkspaceDemo
        activeDepartmentId={activeDepartmentId}
        onSelectDepartment={setActiveDepartmentId}
      />
      <IndustryTemplates
        activeDepartmentId={activeDepartmentId}
        onTryDepartment={setActiveDepartmentId}
      />
    </>
  );
}
