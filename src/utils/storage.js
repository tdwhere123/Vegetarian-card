const KEY = 'cardList'

export function getCardList() {
  const list = uni.getStorageSync(KEY)
  return Array.isArray(list) ? list : []
}

export function saveCardList(list) {
  uni.setStorageSync(KEY, list)
}

export function addOrUpdateCard(card) {
  const list = getCardList()
  const i = list.findIndex(x => x.id === card.id)
  if (i >= 0) {
    list[i] = card
  } else {
    list.unshift(card)
  }
  saveCardList(list)
  return list
}

export function seedDefaultsIfEmpty() {
  let list = getCardList()
  
  // FIX: Migration for broken images (proactively fix existing data)
  let changed = false
  list.forEach(item => {
    // Check for known broken URL
    if (item.image_url && item.image_url.includes('photo-1526318472351-c75aa3f6c1a6')) {
       item.image_url = 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=600&auto=format&fit=crop'
       changed = true
    }
    if (item.image_url && item.image_url.includes('photo-1455619452474-d2be8b1e70cd')) {
       item.image_url = 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=600&auto=format&fit=crop'
       changed = true
    }
  })
  
  if (changed) {
    saveCardList(list)
  }

  if (list.length === 0) {
    const now = Date.now()
    list = [
      {
        id: 'default-1',
        dish_name: '清炒时蔬',
        rarity: 'N',
        image_url: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?q=80&w=600&auto=format&fit=crop', // Updated: Reliable Stir-fry image
        ingredients: ['青菜', '蒜末'],
        steps: ['热油下菜', '翻炒加盐'],
        is_unlocked: true,
        user_photos: [],
        cook_count: 2,
        unlock_time: now - 86400000,
        last_cook_time: now - 3600000
      },
      {
        id: 'default-2',
        dish_name: '番茄意面',
        rarity: 'N',
        image_url: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=600&auto=format&fit=crop', // Updated: Reliable Pasta image
        ingredients: ['番茄', '意面'],
        steps: ['煮面', '炒酱拌匀'],
        is_unlocked: true,
        user_photos: [],
        cook_count: 1,
        unlock_time: now - 172800000,
        last_cook_time: now - 7200000
      }
    ]
    saveCardList(list)
  }
  return list
}
