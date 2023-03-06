export const GroupBox: React.FC<
	React.PropsWithChildren<React.HTMLProps<HTMLDivElement>>
> = (props) => {
	const { className, children, ...others } = props;
	return (
		<div className={`appkit-group-box ${className || ""}`} {...others}>
			{children}
		</div>
	);
};

export const GroupBoxDevider: React.FC = () => {
	return <div className="appkit-group-box-devider" />;
};
