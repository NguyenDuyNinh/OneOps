"use client";
import React from "react";
import ComponentCard from "@/core/shared/ComponentCard";
import FileInput from "@/core/ui/form/FileInput";
import Label from "@/core/ui/form/Label";

export default function FileInputExample() {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
    }
  };

  return (
    <ComponentCard title="File Input">
      <div>
        <Label>Upload file</Label>
        <FileInput onChange={handleFileChange} className="custom-class" />
      </div>
    </ComponentCard>
  );
}
