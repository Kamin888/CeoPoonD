import React from "react";
import { Localized } from "../i18n.js";

const PROPERTY_TYPES = {
  condo: "คอนโด",
  apartment: "อพาร์ตเมนต์",
  house: "บ้าน",
  townhome: "ทาวน์โฮม",
  land: "ที่ดิน",
};

export default function ListingDetailsModal({
  listing,
  imageIndex,
  setImageIndex,
  roomStatusLabels,
  onClose,
  language,
  listingCode,
}) {
  const details = listing.details || {};
  const images = details.images || [];
  const location = [
    details.subdistrict && `แขวง/ตำบล ${details.subdistrict}`,
    details.district && `เขต/อำเภอ ${details.district}`,
    details.province,
    details.road && `ถนน/ซอย ${details.road}`,
    details.nearby && `ใกล้ ${details.nearby}`,
  ].filter(Boolean).join(" · ");

  return (
    <Localized language={language}>
    <div
      className="listing-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="listing-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-modal-title"
      >
        <button
          className="listing-modal-close"
          type="button"
          aria-label="ปิดรายละเอียด"
          onClick={onClose}
        >×</button>
        <div className="listing-modal-gallery">
          {images.length > 0 ? (
            <img src={images[imageIndex]} alt={`รูปที่ ${imageIndex + 1} ของ ${listing.name}`} />
          ) : (
            <div className="listing-modal-no-image">ไม่มีรูปภาพ</div>
          )}
          {images.length > 1 && (
            <>
              <button
                type="button"
                className="gallery-arrow gallery-previous"
                aria-label="รูปก่อนหน้า"
                onClick={() => setImageIndex((index) => (index - 1 + images.length) % images.length)}
              >‹</button>
              <button
                type="button"
                className="gallery-arrow gallery-next"
                aria-label="รูปถัดไป"
                onClick={() => setImageIndex((index) => (index + 1) % images.length)}
              >›</button>
              <span className={`gallery-count${images.length > 1 ? " with-thumbnails" : ""}`}>{imageIndex + 1} / {images.length}</span>
            </>
          )}
        </div>
        {images.length > 1 && (
          <div className="listing-modal-thumbnails" aria-label="เลือกรูปภาพ">
            {images.map((image, index) => (
              <button
                type="button"
                className={index === imageIndex ? "selected" : ""}
                aria-label={`ดูรูปที่ ${index + 1}`}
                aria-pressed={index === imageIndex}
                key={index}
                onClick={() => setImageIndex(index)}
              >
                <img src={image} alt="" />
              </button>
            ))}
          </div>
        )}
        <div className="listing-modal-content">
          <div className="listing-modal-heading">
            <div>
              <span className="eyebrow">{listingCode} · {details.listingType === "sale" ? "ประกาศขาย" : "ประกาศให้เช่า"} · {PROPERTY_TYPES[details.propertyType] || details.otherPropertyType || "อสังหาริมทรัพย์"}</span>
              <h2 id="listing-modal-title">{listing.name}</h2>
              <p className="listing-modal-location">{location || listing.area}</p>
            </div>
            <strong className="listing-modal-price">
              {Number(listing.price).toLocaleString(language === "en" ? "en-US" : "th-TH")} บาท{details.listingType === "sale" ? "" : "/เดือน"}
            </strong>
          </div>
          <div className="listing-quick-facts">
            {[
              ["พื้นที่", details.areaSqm ? `${details.areaSqm} ตร.ม.` : "ไม่ระบุ"],
              ["ห้องนอน", details.bedrooms || "ไม่ระบุ"],
              ["ห้องน้ำ", details.bathrooms || "ไม่ระบุ"],
              ["ชั้น", details.floor || "ไม่ระบุ"],
              ["ที่จอดรถ", `${details.parking || 0} คัน`],
              ["พร้อมเข้าอยู่", details.availableDate || "ไม่ระบุ"],
              ["สถานะห้อง", roomStatusLabels[listing.room_status] || "ว่าง"],
              ...(listing.room_status === "occupied" && details.tenantContractEndDate
                ? [["วันหมดสัญญาเช่า", details.tenantContractEndDate]]
                : []),
            ].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}
          </div>
          {details.listingType === "rent" && (
            <section className="listing-modal-section">
              <h3>เงื่อนไขการเช่า</h3>
              <p>เงินประกัน {Number(details.deposit || 0).toLocaleString(language === "en" ? "en-US" : "th-TH")} บาท · ค่าเช่าล่วงหน้า {details.advanceRent || 0} เดือน · สัญญาขั้นต่ำ {details.minContract || "ไม่ระบุ"} เดือน</p>
            </section>
          )}
          <section className="listing-modal-section">
            <h3>เฟอร์นิเจอร์และสิ่งอำนวยความสะดวก</h3>
            <p>เฟอร์นิเจอร์: {details.furnished === "fully" ? "ตกแต่งครบ" : details.furnished === "partial" ? "มีบางส่วน" : "ไม่มี"}</p>
            <div className="listing-detail-tags">
              {[...(details.appliances || []), ...(details.facilities || [])].map((item) => <span key={item}>{item}</span>)}
              <span>{details.pets ? "เลี้ยงสัตว์ได้" : "ไม่อนุญาตสัตว์เลี้ยง"}</span>
            </div>
          </section>
          {details.highlights?.length > 0 && (
            <section className="listing-modal-section">
              <h3>จุดเด่น</h3>
              <div className="listing-detail-tags">{details.highlights.map((item) => <span key={item}>{item}</span>)}</div>
            </section>
          )}
          <section className="listing-modal-section">
            <h3>รายละเอียดเพิ่มเติม</h3>
            <p className="listing-modal-description">{details.description || "ไม่มีรายละเอียดเพิ่มเติม"}</p>
          </section>
          <section className="listing-contact">
            <div>
              <span className="eyebrow">ผู้ลงประกาศ</span>
              <strong>{listing.owner_email || "บัญชีผู้ใช้เดิม"}</strong>
              {details.contactName && <span>{details.contactName}</span>}
            </div>
            <div className="listing-contact-links">
              {details.contactPhone && <a href={`tel:${details.contactPhone}`}>โทร {details.contactPhone}</a>}
              {details.contactEmail && <a href={`mailto:${details.contactEmail}`}>อีเมล</a>}
              {details.lineId && <span>LINE: {details.lineId}</span>}
            </div>
          </section>
        </div>
      </section>
    </div>
    </Localized>
  );
}
