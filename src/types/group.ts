// src/types/group.ts (nuevo archivo)

export interface GroupListItem {
  id: string
  name: string
  city: string | null
  region: string | null
  cover_url: string | null
  slug: string
  description?: string | null
}