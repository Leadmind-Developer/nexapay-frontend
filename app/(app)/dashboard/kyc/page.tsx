"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";

const ID_TYPES = ["Passport", "Driver's License", "National ID"];

type UploadFile = { label: string; file?: File; endpoint: string; extraData?: Record<string, any> };

export default function KycWizard({ userPhone = "" }) {
  const [step, setStep] = useState<"bvn-nin" | "kyc">("bvn-nin");
  const [loading, setLoading] = useState(false);

  // BVN/NIN
  const [bvn, setBvn] = useState("");
  const [nin, setNin] = useState("");
  const [bvnNinValidated, setBvnNinValidated] = useState(false);
  const [phone, setPhone] = useState(userPhone);

  // KYC
  const [kycStatus, setKycStatus] = useState<string | null>(null);
  const [idType, setIdType] = useState(ID_TYPES[0]);
  const [idNumber, setIdNumber] = useState("");
  const [houseAddress, setHouseAddress] = useState("");
  const [uploads, setUploads] = useState<UploadFile[]>([
    { label: "ID", endpoint: "upload-id" },
    { label: "Selfie", endpoint: "upload-selfie" },
    { label: "Proof of Address", endpoint: "upload-proof" },
  ]);

  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch existing KYC
  const fetchKyc = async () => {
    setLoading(true);
    try {
      const res = await api.get("/kyc/status");
      const statusObj = res.data.status ?? {};
      setKycStatus(statusObj.status ?? null);
      setHouseAddress(statusObj.houseAddress ?? "");
      setIdType(statusObj.idType ?? ID_TYPES[0]);
      setIdNumber(statusObj.idNumber ?? "");
      setUploads((prev) =>
        prev.map((u) => {
          if (u.label === "ID") {
            return { ...u, extraData: { idType: statusObj.idType, idNumber: statusObj.idNumber } };
          }
          return u;
        })
      );
    } catch (err) {
      console.error(err);
      alert("Failed to fetch KYC status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKyc();
  }, []);

  const validateBvnNin = async () => {
    if (!bvn || !nin || !phone) return alert("Please fill BVN, NIN, and phone");
    setLoading(true);
    try {
      const res = await api.post("/user/validate-bvn-nin", { bvn, nin, phone });
      if (res.data.success) {
        setBvnNinValidated(true);
        setStep("kyc");
        alert(res.data.message ?? "Validated successfully");
      } else {
        alert(res.data.message ?? "Validation failed");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message ?? "Validation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return;
    setUploads((prev) => {
      const copy = [...prev];
      copy[index].file = file;
      return copy;
    });
  };

  const uploadFile = async (file: UploadFile) => {
    if (!file.file) return alert(`Please select a ${file.label} file first`);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file.file);
      if (file.label === "ID") {
        formData.append("idType", idType);
        formData.append("idNumber", idNumber);
      }
      const res = await api.post(`/kyc/${file.endpoint}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message);
      fetchKyc();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async () => {
    if (!houseAddress) return alert("Please enter your house address");
    setLoading(true);
    try {
      const res = await api.post("/kyc/address", { houseAddress });
      alert(res.data.message);
      fetchKyc();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message ?? "Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <span className="text-green-500 text-[5rem]">✅</span>
        <h2 className="text-2xl font-bold mt-4">KYC Completed!</h2>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">KYC Verification</h1>

      {/* Step Wizard */}
      <div className="flex gap-4 mb-6">
        <div className={`flex-1 text-center py-2 border-b-4 ${step === "bvn-nin" ? "border-blue-700" : "border-gray-300"}`}>
          BVN/NIN
        </div>
        <div className={`flex-1 text-center py-2 border-b-4 ${step === "kyc" ? "border-blue-700" : "border-gray-300"}`}>
          KYC Documents
        </div>
      </div>

      {step === "bvn-nin" && (
        <div className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Phone</label>
            <input className="w-full p-2 border rounded" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className="block font-semibold mb-1">BVN</label>
            <input className="w-full p-2 border rounded" value={bvn} onChange={(e) => setBvn(e.target.value)} />
          </div>
          <div>
            <label className="block font-semibold mb-1">NIN</label>
            <input className="w-full p-2 border rounded" value={nin} onChange={(e) => setNin(e.target.value)} />
          </div>
          {!bvnNinValidated && (
            <button className="w-full py-2 bg-blue-700 text-white rounded" onClick={validateBvnNin}>
              Validate BVN & NIN
            </button>
          )}
        </div>
      )}

      {step === "kyc" && (
        <div className="space-y-4">
          <p>Status: {kycStatus ?? "Not started"}</p>
          <div>
            <label className="block font-semibold mb-1">ID Type</label>
            <div className="flex gap-2">
              {ID_TYPES.map((type) => (
                <button
                  key={type}
                  className={`px-3 py-1 border rounded ${idType === type ? "bg-blue-100 border-blue-700" : ""}`}
                  onClick={() => setIdType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">ID Number</label>
            <input className="w-full p-2 border rounded" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {uploads.map((u, i) => (
              <div key={u.label} className="flex flex-col items-center gap-2">
                {u.file && <img src={URL.createObjectURL(u.file)} alt={u.label} className="w-32 h-32 object-cover rounded" />}
                <input type="file" onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)} />
                <button className="py-1 px-2 bg-blue-700 text-white rounded" onClick={() => uploadFile(u)}>
                  Upload {u.label}
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="block font-semibold mb-1">House Address</label>
            <input className="w-full p-2 border rounded mb-2" value={houseAddress} onChange={(e) => setHouseAddress(e.target.value)} />
            <button className="py-2 px-4 bg-blue-700 text-white rounded" onClick={saveAddress}>
              Save Address
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-blue-700 mt-4">Processing...</p>}
    </div>
  );
}
