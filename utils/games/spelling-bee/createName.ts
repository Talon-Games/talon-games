// hope no one passes in wrong len outer into this :)
export default function createName(center: string, outer: string[]): string {
  return (
    outer[0] + outer[1] + outer[2] + center + outer[3] + outer[4] + outer[5]
  );
}
