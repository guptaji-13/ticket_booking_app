import { customType } from "drizzle-orm/pg-core";

export const bigintAsText = customType<{
	data: string;
	driverData: string;
}>({
	dataType() {
		return "bigint";
	},
	fromDriver(value) {
		return value.toString();
	},
});
