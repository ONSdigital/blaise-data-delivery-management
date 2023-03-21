export function getDDFileStatusStyle(status: string, errorInfo: string | null | undefined): string {
    if (errorInfo !== null && errorInfo !== undefined && errorInfo !== "") {
        return "error";
    }
    switch (status) {
    case "inactive":
        return "dead";
    case "in_arc":
        return "success";

    case "errored":
        return "error";
    default:
        return "pending";
    }
}
