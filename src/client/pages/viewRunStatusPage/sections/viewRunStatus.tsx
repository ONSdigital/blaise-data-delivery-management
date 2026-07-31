import React, { type ReactElement } from "react";
import BatchStatusList from "./batchStatusList";

type Props = {
    statusDescriptionList: { [key: string]: string };
};

function ViewRunStatus({ statusDescriptionList }: Props): ReactElement {
    return <BatchStatusList statusDescriptionList={statusDescriptionList} />;
}

export default ViewRunStatus;
