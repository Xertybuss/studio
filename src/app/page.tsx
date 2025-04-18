"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getHeartRate } from "@/services/heart-rate";
import {
  EstimateTimeToHeartAttackOutput,
  estimateTimeToHeartAttack,
} from "@/ai/flows/estimate-time-to-heart-attack";
import {
  PredictHeartAttackRiskOutput,
  predictHeartAttackRisk,
} from "@/ai/flows/predict-heart-attack-risk";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// Define color-coded system
const riskColors = {
  low: "text-green-500",
  medium: "text-yellow-500",
  high: "text-red-500",
};

export default function Home() {
  const [heartRate, setHeartRate] = useState(72);
  const [riskLevel, setRiskLevel] = useState<
    PredictHeartAttackRiskOutput["riskLevel"]
  >("low");
  const [estimatedTime, setEstimatedTime] = useState("N/A");
  const [userData, setUserData] = useState(
    "Age: 30, Gender: Male, Medical History: None"
  );
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHeartRate = async () => {
      const data = await getHeartRate();
      setHeartRate(data.bpm);
    };

    fetchHeartRate();
    // setInterval(fetchHeartRate, 60000); // Fetch every minute
  }, []);

  const handleRiskPrediction = async () => {
    setLoading(true);
    try {
      const prediction = await predictHeartAttackRisk({ userData });
      setRiskLevel(prediction.riskLevel);
      setEstimatedTime(prediction.estimatedTimeWindow);
      if (prediction.riskLevel === "high") {
        setAlertVisible(true);
        toast({
          title: "High Risk Detected",
          description:
            "A high heart attack risk has been detected. Please seek medical attention immediately.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Risk Prediction Error:", error);
      toast({
        title: "Error",
        description: "Failed to predict risk. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTimeEstimation = async () => {
    setLoading(true);
    try {
      const estimation = await estimateTimeToHeartAttack({
        heartRateBpm: heartRate,
        userData,
      });
      setEstimatedTime(estimation.estimatedTimeWindow);
      setRiskLevel(estimation.riskLevel);
    } catch (error) {
      console.error("Time Estimation Error:", error);
      toast({
        title: "Error",
        description: "Failed to estimate time. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = () => {
    setAlertVisible(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md rounded-lg shadow-md bg-secondary">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-primary">
            HeartWise Watch
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Real-time Heart Attack Risk Prediction
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {alertVisible && (
            <Alert variant="destructive">
              <AlertTitle>Emergency Alert</AlertTitle>
              <AlertDescription>
                High heart attack risk detected. Contact emergency services.
                <Button
                  variant="link"
                  onClick={dismissAlert}
                  className="ml-2 text-destructive underline-offset-4"
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground">
              Heart Rate:{" "}
              <span className="font-bold text-accent">{heartRate} BPM</span>
            </p>
          </div>
          <div className="mb-4">
            <p className="text-sm font-medium text-foreground">
              Risk Level:{" "}
              <span className={`font-bold ${riskColors[riskLevel]}`}>
                {riskLevel}
              </span>
            </p>
            <p className="text-sm text-muted-foreground">
              Estimated Time: {estimatedTime}
            </p>
          </div>
          <div className="flex justify-between">
            <Button
              onClick={handleRiskPrediction}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md shadow-sm"
            >
              {loading ? "Predicting..." : "Predict Risk"}
            </Button>
            <Button
              onClick={handleTimeEstimation}
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/80 rounded-md shadow-sm"
            >
              {loading ? "Estimating..." : "Estimate Time"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
