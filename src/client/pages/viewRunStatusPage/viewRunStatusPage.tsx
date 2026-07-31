import React, { type ReactElement } from "react";
import ViewRunStatus from "./sections/viewRunStatus";

type Props = {
    statusDescriptionList: { [key: string]: string };
};

function ViewRunStatusPage({ statusDescriptionList }: Props): ReactElement {
    return <ViewRunStatus statusDescriptionList={statusDescriptionList} />;
}

export default ViewRunStatusPage;
