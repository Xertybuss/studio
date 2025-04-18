/**
 * Represents heart rate data.
 */
export interface HeartRateData {
  /**
   * The heart rate in beats per minute (BPM).
   */
  bpm: number;
  /**
   * The timestamp of the heart rate measurement.
   */
  timestamp: Date;
}

/**
 * Asynchronously retrieves heart rate data.
 *
 * @returns A promise that resolves to a HeartRateData object containing BPM and timestamp.
 */
export async function getHeartRate(): Promise<HeartRateData> {
  // TODO: Implement this by calling the smartwatch's sensor API.

  return {
    bpm: 72,
    timestamp: new Date(),
  };
}
