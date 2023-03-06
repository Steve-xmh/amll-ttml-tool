export const TextField: React.FC<React.HTMLProps<HTMLInputElement>> = (
	props,
) => {
	const { className, type, ...others } = props;
	return (
		<input
			type={type || "text"}
			className={`appkit-text-field ${className || ""}`}
			{...others}
		/>
	);
};
