export default function useTimeSpeedPerceptionMode(remainingTimeInSeconds: number) {
    // Activate when there are 30 minutes (1800 seconds) or less remaining
    const isPerceptionActive = remainingTimeInSeconds <= 1800;

    return { isPerceptionActive };
}
