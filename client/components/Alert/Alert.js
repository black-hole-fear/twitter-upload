export const AlertSuccess = (props) => {
    return (
        <div className="alert alert-success" role="alert">
            {props.children}
        </div>
    );
};

export const AlertError = (props) => {
    return (
        <div className="alert alert-danger" role="alert">
            {props.children}
        </div>
    );
};
