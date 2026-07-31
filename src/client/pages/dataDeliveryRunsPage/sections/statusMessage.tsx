import React, { type ReactElement } from "react";
import { ONSPanel } from "blaise-design-system-react-components";

type Props = {
    status: string;
};

function StatusMessage({ status }: Props): ReactElement | null {
    if (status === "") {
        return null;
    }

    return (
        <ONSPanel status={status.includes("success") ? "success" : "error"}>
            <p>{status}</p>
        </ONSPanel>
    );
}

export default StatusMessage;
