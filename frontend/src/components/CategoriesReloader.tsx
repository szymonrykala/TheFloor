import { useCallback, useState } from "react"
import { reloadCategories } from "../api/http"


export function CategoriesReloadButton(props: any) {
    const [categoriesReloaded, setCategoriesReloaded] = useState<boolean>(false)

    const refreshCategories = useCallback(async () => {
        if (!confirm("Chcesz przeładować kategorie?")) {
            return
        }
        await reloadCategories()
        setCategoriesReloaded(true)
    }, [])

    return < button {...props} type="button" onClick={refreshCategories} >
        {categoriesReloaded ? "✅" : "🔄"}
    </button>
}