# แผนการปรับปรุงระบบ Pagination (Cursor-based) และ Real-time Append

ปรับปรุงระบบการดึงข้อมูล `ai_contents` จากแบบเหมาทั้งหมด (GetAll) เป็นแบบทีละส่วน (Pagination) โดยใช้ Cursor เพื่อความแม่นยำและประสิทธิภาพสูงสุด เมื่อทำงานร่วมกับระบบ Real-time Socket

## User Review Required

> [!IMPORTANT]
> - **Cursor Selection**: เราจะใช้ `created_at` (หรือ `id` ในบางกรณี) เป็น Cursor เพื่อให้สามารถดึงข้อมูล "ก่อนหน้า" หรือ "ถัดไป" ได้อย่างแม่นยำแม้ข้อมูลจะมีการแทรกเพิ่มตลอดเวลา
> - **State Management**: ข้อมูลใน store/hook จะต้องเปลี่ยนจากแบบ Overwrite เป็นแบบ Append (เมื่อ Load More) และ Prepend (เมื่อมี Real-time INSERT)

## Proposed Changes

### 1. Data Layer (Repository)

#### [MODIFY] [IContentRepository.ts](file:///Users/marosdeeuma/ai-content-creator-nextjs/src/application/repositories/IContentRepository.ts)
- เพิ่ม Method `getCursorPaginated(filter: ContentCursorFilter): Promise<CursorPaginatedResult<Content>>`
- `ContentCursorFilter` จะประกอบด้วย `cursor`, `limit`, `status`, และ `direction` (next/prev)

#### [MODIFY] [SupabaseContentRepository.ts](file:///Users/marosdeeuma/ai-content-creator-nextjs/src/infrastructure/repositories/SupabaseContentRepository.ts)
- Implement การ Query โดยใช้ `.lte('created_at', cursor)` สำหรับการโหลดข้อมูลย้อนหลัง (Older items)
- ประสิทธิภาพการ Query จะดีกว่า Offset-based มากเมื่อข้อมูลมีจำนวนเป็นแสน/ล้านแถว

### 2. Presentation Layer (Presenters & Hooks)

#### [MODIFY] [useGalleryPresenter.ts](file:///Users/marosdeeuma/ai-content-creator-nextjs/src/presentation/presenters/gallery/useGalleryPresenter.ts)
- เพิ่ม State `hasMore: boolean` และ `lastCursor: string | null`
- เพิ่ม Action `loadMore()`: ดึงข้อมูลหน้าถัดไปและนำมาต่อท้าย (`...oldContents, ...newContents`)
- **Real-time Integration**: ใช้ `repository.subscribe()` เพื่อฟัง Event `INSERT` และนำข้อมูลใหม่มาวางไว้บนสุด (`[newContent, ...oldContents]`)

#### [MODIFY] [useTimelinePresenter.ts](file:///Users/marosdeeuma/ai-content-creator-nextjs/src/presentation/presenters/timeline/useTimelinePresenter.ts)
- ปรับโครงสร้างการ Group ข้อมูลตามวัน ให้รองรับการ Append ข้อมูลใหม่แบบ Real-time เข้าไปใน Group วันปัจจุบัน หรือสร้าง Group วันใหม่ถ้าจำเป็น

### 3. UI Layer (Components)

#### [NEW] [LoadMoreButton.tsx](file:///Users/marosdeeuma/ai-content-creator-nextjs/src/presentation/components/ui/LoadMoreButton.tsx)
- ปุ่มโหลดข้อมูลเพิ่มแบบพรีเมียม พร้อม Loading state และ Skeleton integration

#### [MODIFY] [GalleryView.tsx](file:///Users/marosdeeuma/ai-content-creator-nextjs/src/presentation/components/gallery/GalleryView.tsx)
- เพิ่มส่วนท้ายของ Grid เพื่อแสดงปุ่ม Load More หรือระบบ Infinite Scroll (Intersection Observer)

## Verification Plan

### Automated Tests
- ตรวจสอบความถูกต้องของลำดับข้อมูลเมื่อมีการ Load More สลับกับ Real-time INSERT

### Manual Verification
1. เปิดหน้า Gallery ค้างไว้
2. เปิด API /api/cron/generate เพื่อสร้างคอนเทนต์ใหม่
3. ตรวจสอบว่าคอนเทนต์ใหม่ปรากฏขึ้นที่ "บนสุด" ของ Gallery ทันทีโดยไม่ต้อง Refresh
4. เลื่อนลงไปด้านล่างและกด Load More เพื่อตรวจสอบว่าข้อมูลที่ดึงมาใหม่ไม่ซ้ำกับข้อมูลเดิม
