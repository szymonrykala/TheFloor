import { QueryClient, useQuery } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'
import type { Category, Game, GameAssociation, TGameBoard, GameDetails, TQuestion } from './http.types'
import { API_V1 } from './const'



async function apiCall<T>(url: string, method: string = "GET") {
    const response = await fetch(url, { method })
    if (response.ok) {
        return await response.json() as Promise<T>
    }
    return null
}

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 24, // 24 hours
        },
    },
})

export const persister = createAsyncStoragePersister({
    storage: window.localStorage,
})

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => await apiCall<Category[]>(API_V1 + "/categories"),
    })
}

export function useGames() {
    return useQuery({
        queryKey: ['games'],
        queryFn: async () => await apiCall<Game[]>(API_V1 + "/games"),
    })
}

export function useGameDetails(gameId: string | undefined) {
    return useQuery({
        queryKey: ['gameId'],
        queryFn: async () => await apiCall<GameDetails>(API_V1 + "/games/" + gameId),
        enabled: !!gameId
    })
}

export function useGameBoard(gameId: string | undefined) {
    return useQuery({
        queryKey: ['gameBoard'],
        queryFn: async () => (await apiCall<TGameBoard>(API_V1 + "/games/" + gameId + "/board")) || [[]],
        enabled: !!gameId
    })
}

export async function getGameBoard(gameId: string | undefined) {
    if (gameId === undefined) {
        return [[]]
    }
    return (await apiCall<TGameBoard>(API_V1 + "/games/" + gameId + "/board")) || [[]]
}

export async function getRandomPlayer(gameId: string | undefined) {
    return await apiCall<GameAssociation>(API_V1 + "/games/" + gameId + "/random-player")
}

export async function reloadCategories() {
    return await apiCall<void>(API_V1 + "/categories/reload", "POST")
}

export function getImageUrl(question?: TQuestion): string | undefined {
    if (!question) return undefined
    return API_V1 + `/categories/${question.category_name}/image/${question.image_path}`
}

export async function deletePlayer(gameId: string, playerId: string) {
    await fetch(
        API_V1 + `/games/${gameId}/player/${playerId}`,
        { method: "DELETE" }
    )
}