import resources from "virtual:i18next-loader";
import i18n from "i18next";
import ICU from "i18next-icu";
import { initReactI18next } from "react-i18next";

type TranslationResource = typeof resources;

console.log("Locale Resources", resources);

declare module "i18next" {
	// Extend CustomTypeOptions
	interface CustomTypeOptions {
		// Extend the resources type to include all our translation keys
		resources: {
			translation: TranslationResource;
		};
		// Add defaultNS type
		defaultNS: "translation";
		// Add returnNull type
		returnNull: false;
		// Define allowed keys for translations
		allowedKeys: keyof TranslationResource;
	}
}

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.use(ICU)
	.init({
		resources,
		debug: import.meta.env.DEV,
		fallbackLng: "zh-CN",
		interpolation: {
			escapeValue: false, // react already safes from xss
		},
		returnNull: false,
	})
	.then(() =>
		i18n.changeLanguage(localStorage.getItem("language") || navigator.language),
	);

export default i18n;
