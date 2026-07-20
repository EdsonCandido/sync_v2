import { Input, type InputProps } from "@chakra-ui/react";

import { maskMoneyInput } from "@/lib/money";

export type MoneyInputProps = Omit<InputProps, "type" | "value" | "onChange"> & {
	value: string;
	onChange: (masked: string) => void;
	allowNegative?: boolean;
};

/** Input de valor monetário BRL com máscara enquanto digita. */
export function MoneyInput({
	value,
	onChange,
	allowNegative = false,
	...props
}: MoneyInputProps) {
	return (
		<Input
			{...props}
			inputMode="decimal"
			autoComplete="off"
			value={value}
			onChange={(e) =>
				onChange(maskMoneyInput(e.target.value, { allowNegative }))
			}
		/>
	);
}
