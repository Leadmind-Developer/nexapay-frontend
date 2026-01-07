// screens/AirtimeScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import api from "../lib/api";

interface DataPlan {
  planId: string;
  planName: string;
  price: string;
  validity: string;
}

type Stage = "form" | "review" | "processing" | "success" | "error";

const NETWORKS = [
  { label: "MTN", value: "mtn" },
  { label: "GLO", value: "glo" },
  { label: "Airtel", value: "airtel" },
  { label: "9Mobile", value: "etisalat" },
];

const PREFIX_MAP: Record<string, string[]> = {
  mtn: ["0703","0706","0803","0806","0810","0813","0814","0816","0903","0906","0913","0916"],
  glo: ["0705","0805","0807","0811","0815","0905"],
  airtel: ["0701","0708","0802","0808","0812","0901","0902","0904","0912"],
  etisalat: ["0709","0809","0817","0818","0908","0909"],
};

const normalizePhone = (value: string) => {
  let v = value.replace(/\s+/g, "");
  if (v.startsWith("+234")) v = "0" + v.slice(4);
  if (v.startsWith("234")) v = "0" + v.slice(3);
  return v;
};

const AirtimeScreen: React.FC = () => {
  const [stage, setStage] = useState<Stage>("form");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // User Inputs
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [network, setNetwork] = useState<string | null>(null);

  // Data Plans
  const [clickatellPlans, setClickatellPlans] = useState<DataPlan[]>([]);
  const [openApiPlans, setOpenApiPlans] = useState<DataPlan[]>([]);

  // Purchase result
  const [receipt, setReceipt] = useState<any>(null);
  const [reference, setReference] = useState<string | null>(null);

  // ---------------- Fetch Data Plans ----------------
  const fetchClickatellPlans = async () => {
    try {
      const res = await api.get("/wema/airtime/clickatell/data/plans");
      setClickatellPlans(res.data.result || []);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch Clickatell data plans");
    }
  };

  const fetchOpenApiPlans = async () => {
    try {
      const res = await api.get("/wema/airtime/openapi/data/plans");
      setOpenApiPlans(res.data.result || []);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", "Failed to fetch OpenAPI data plans");
    }
  };

  useEffect(() => {
    fetchClickatellPlans();
    fetchOpenApiPlans();
  }, []);

  // ---------------- AUTO-DETECT NETWORK ----------------
  useEffect(() => {
    if (phone.length < 4) return;
    const prefix = phone.slice(0, 4);
    for (const [key, list] of Object.entries(PREFIX_MAP)) {
      if (list.includes(prefix)) {
        setNetwork(key);
        return;
      }
    }
    setNetwork(null);
  }, [phone]);

  // ---------------- PURCHASE ----------------
  const purchase = async () => {
    if (!phone || !amount || !network) {
      return Alert.alert("Validation", "Please fill all required fields and select a network");
    }

    setStage("processing");
    setErrorMessage("");
    setLoading(true);

    try {
      const res = await api.post("/wema/airtime/purchase", {
        phone: normalizePhone(phone),
        amount: Number(amount),
        network,
      });

      if (res.data?.success) {
        setReceipt(res.data.data || res.data);
        setReference(res.data?.reference || res.data?.requestId || null);
        setStage("success");
      } else {
        setErrorMessage(res.data?.message || "Unable to complete this transaction");
        setStage("error");
      }
    } catch (err: any) {
      console.error("Airtime purchase error:", err);
      setErrorMessage(err.response?.data?.message || "Something went wrong");
      setStage("error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RENDER ----------------
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Buy Airtime</Text>

      {/* ===== FORM ===== */}
      {stage === "form" && (
        <View style={styles.section}>
          <Text style={styles.label}>Select Network</Text>
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            {NETWORKS.map(n => (
              <TouchableOpacity
                key={n.value}
                onPress={() => setNetwork(n.value)}
                style={[
                  styles.networkBtn,
                  network === n.value && styles.networkBtnActive,
                ]}
              >
                <Text style={styles.networkLabel}>{n.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <Button
            title="Review"
            onPress={() => setStage("review")}
            disabled={!phone || !amount || !network}
          />
        </View>
      )}

      {/* ===== REVIEW ===== */}
      {stage === "review" && (
        <View style={styles.section}>
          <Text style={styles.label}>Review Purchase</Text>
          <Text>Network: {network}</Text>
          <Text>Phone: {phone}</Text>
          <Text>Amount: ₦{amount}</Text>

          <View style={{ flexDirection: "row", marginTop: 12, gap: 12 }}>
            <Button title="Back" onPress={() => setStage("form")} />
            <Button title="Pay" onPress={purchase} />
          </View>
        </View>
      )}

      {/* ===== PROCESSING ===== */}
      {stage === "processing" && (
        <View style={styles.section}>
          <Text>Processing your request…</Text>
          <ActivityIndicator size="large" color="#007bff" />
        </View>
      )}

      {/* ===== SUCCESS ===== */}
      {stage === "success" && (
        <View style={[styles.section, styles.success]}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>Purchase Successful 🎉</Text>
          {reference && <Text>Reference: {reference}</Text>}
        </View>
      )}

      {/* ===== ERROR ===== */}
      {stage === "error" && (
        <View style={[styles.section, styles.error]}>
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>Something went wrong</Text>
          <Text>{errorMessage}</Text>
        </View>
      )}

      {loading && <ActivityIndicator size="large" color="#007bff" />}
    </ScrollView>
  );
};

export default AirtimeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  section: { marginBottom: 20 },
  label: { fontWeight: "bold", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    marginBottom: 12,
    borderRadius: 6,
  },
  networkBtn: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginRight: 8,
  },
  networkBtnActive: {
    borderColor: "#fbbf24",
    backgroundColor: "#fde68a",
  },
  networkLabel: {
    fontWeight: "bold",
  },
  success: {
    padding: 12,
    backgroundColor: "#d1fae5",
    borderRadius: 6,
  },
  error: {
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 6,
  },
});
