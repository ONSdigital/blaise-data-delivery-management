import { Panel } from "blaise-design-system-react-components";
import { type ReactElement } from "react";

type Props = {
  status: string;
};

function StatusMessage({ status }: Props): ReactElement | null {
  if (status === "") {
    return null;
  }

  return (
    <Panel status={status.includes("success") ? "success" : "error"}>
      <p>{status}</p>
    </Panel>
  );
}

export default StatusMessage;
