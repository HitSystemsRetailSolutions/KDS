import { createI18n } from "vue-i18n";
import { getTraducciones } from "./traduccionesService";

export const i18n = createI18n({
    legacy: false,
    locale: "es",
    fallbackLocale: "es",
    messages: {},
});

export async function setupI18n(force = false) {
    try {
        const data = await getTraducciones(force);
        if (!data || !Array.isArray(data)) {
            console.warn("No se pudieron cargar las traducciones del backend, usando idioma por defecto.");
            return false;
        }

        const messages = data.reduce((acc, item) => {
            item.languages.forEach((language) => {
                const langCode = Object.keys(language)[0].toLowerCase();
                const value = language[langCode];

                if (!acc[langCode]) acc[langCode] = {};

                const group = item.group || 'common';

                if (!acc[langCode][group]) {
                    acc[langCode][group] = {};
                }

                acc[langCode][group][item.key] = value;
            });
            return acc;
        }, {});

        Object.keys(messages).forEach((locale) => {
            i18n.global.setLocaleMessage(locale, messages[locale]);
        });

        return true;
    } catch (err) {
        console.error("Fallo al cargar traducciones en KDS", err);
        return false;
    }
}
