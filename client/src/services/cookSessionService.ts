import { apiClient } from './apiClient';

export type CookSessionStatus = 'active' | 'completed' | 'cancelled';
export type CookSessionItemStatus = 'unknown' | 'have' | 'need';

export interface CookSession {
  id: number;
  user_id: number;
  recipe_id: number;
  status: CookSessionStatus;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface CookSessionSummary extends CookSession {
  recipe_title: string;
  item_count: number;
  unknown_count: number;
  have_count: number;
  need_count: number;
}

export interface CookSessionDetail extends CookSession {
  recipe_title: string;
}

export interface CookSessionItem {
  id: number;
  cook_session_id: number;
  recipe_ingredient_id: number | null;
  display_name: string;
  quantity_value: string | null;
  quantity_unit: string | null;
  sort_order: number;
  status: CookSessionItemStatus | null;
  created_at: string;
  updated_at: string;
}

type ApiDataResponse<TData> = {
  data: TData;
};

type CookSessionsData = {
  cookSessions: CookSessionSummary[];
};

type CookSessionData = {
  cookSession: CookSession;
};

type CreateCookSessionData = CookSessionData & {
  resumed: boolean;
};

type CookSessionDetailData = {
  cookSession: CookSessionDetail;
  items: CookSessionItem[];
};

type CookSessionItemData = {
  cookSessionItem: CookSessionItem;
};

export interface GetCookSessionsOptions {
  status?: CookSessionStatus;
}

export interface UpdateCookSessionItemPayload {
  status: CookSessionItemStatus;
}

export type CookSessionsResponse = ApiDataResponse<CookSessionsData>;
export type CookSessionResponse = ApiDataResponse<CookSessionData>;
export type CreateCookSessionResponse = ApiDataResponse<CreateCookSessionData>;
export type CookSessionDetailResponse = ApiDataResponse<CookSessionDetailData>;
export type CookSessionItemResponse = ApiDataResponse<CookSessionItemData>;

const cookSessionsPath = '/cook-sessions';

export const createCookSession = (recipeId: number) =>
  apiClient.post<CreateCookSessionResponse>(
    `/recipes/${recipeId}/cook-sessions`
  );

export const getCookSessions = (options: GetCookSessionsOptions = {}) =>
  apiClient.get<CookSessionsResponse>(cookSessionsPath, {
    query: { status: options.status },
  });

export const getCookSession = (cookSessionId: number) =>
  apiClient.get<CookSessionDetailResponse>(
    `${cookSessionsPath}/${cookSessionId}`
  );

export const updateCookSessionItem = (
  cookSessionId: number,
  cookSessionItemId: number,
  payload: UpdateCookSessionItemPayload
) =>
  apiClient.patch<CookSessionItemResponse>(
    `${cookSessionsPath}/${cookSessionId}/items/${cookSessionItemId}`,
    payload
  );

export const completeCookSession = (cookSessionId: number) =>
  apiClient.patch<CookSessionResponse>(
    `${cookSessionsPath}/${cookSessionId}/complete`
  );

export const cancelCookSession = (cookSessionId: number) =>
  apiClient.patch<CookSessionResponse>(
    `${cookSessionsPath}/${cookSessionId}/cancel`
  );

export const cookSessionService = {
  createCookSession,
  getCookSessions,
  getCookSession,
  updateCookSessionItem,
  completeCookSession,
  cancelCookSession,
};
