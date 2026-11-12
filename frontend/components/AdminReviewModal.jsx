import React from "react";
import { Localized } from "../i18n.js";

const PROPERTY_TYPES = {
  condo: "คอนโด",
  apartment: "อพาร์ตเมนต์",
  house: "บ้าน",
  townhome: "ทาวน์โฮม",
  land: "ที่ดิน",
};

export default function AdminReviewModal({ listing, onClose, onApprove, approving, language }) {
  const details = listing.details || {};
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
      className="admin-review-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="admin-review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-review-modal-title"
      >
        <button className="admin-review-modal-close" type="button" aria-label="ปิดรายละเอียด" onClick={onClose}>×</button>
        <div className="admin-review-modal-content">
          <div className="admin-review-modal-heading">
            <div>
              <span className="status-badge status-pending_review">รอตรวจสอบ</span>
              <h2 id="admin-review-modal-title">{listing.name}</h2>
              <p>{location || listing.area || "ไม่ได้ระบุทำเล"}</p>
            </div>
            <strong>{Number(listing.price).toLocaleString(language === "en" ? "en-US" : "th-TH")} บาท{details.listingType === "sale" ? "" : "/เดือน"}</strong>
          </div>
          <div className="admin-review-modal-images">
            {(details.images || []).length > 0 ? details.images.map((image, index) => (
              <img src={image} alt={`รูปที่ ${index + 1} ของ ${listing.name}`} key={index} />
            )) : <p>ไม่มีรูปภาพ</p>}
          </div>
          <dl className="admin-review-modal-details">
            <dt>ประเภทประกาศ</dt><dd>{details.listingType === "sale" ? "ประกาศขาย" : "ประกาศให้เช่า"}</dd>
            <dt>ประเภททรัพย์</dt><dd>{details.propertyType === "other" ? details.otherPropertyType : PROPERTY_TYPES[details.propertyType] || "ไม่ได้ระบุ"}</dd>
            <dt>ขนาดและห้อง</dt><dd>{details.areaSqm || "-"} ตร.ม. · {details.bedrooms || "-"} ห้องนอน · {details.bathrooms || "-"} ห้องน้ำ · ชั้น {details.floor || "-"} · ที่จอดรถ {details.parking || 0} คัน</dd>
            <dt>พร้อมเข้าอยู่/ขาย</dt><dd>{details.availableDate || "ไม่ได้ระบุ"}</dd>
            {details.listingType === "rent" && <><dt>เงื่อนไขเช่า</dt><dd>ประกัน {details.deposit || 0} บาท · ล่วงหน้า {details.advanceRent || 0} เดือน · สัญญาขั้นต่ำ {details.minContract || "-"} เดือน</dd></>}
            {details.tenantContractEndDate && <><dt>วันหมดสัญญาเช่า</dt><dd>{details.tenantContractEndDate}</dd></>}
            <dt>เฟอร์นิเจอร์/เครื่องใช้ไฟฟ้า</dt><dd>{[details.furnished === "fully" ? "ตกแต่งครบ" : details.furnished === "partial" ? "มีเฟอร์นิเจอร์บางส่วน" : "ไม่มีเฟอร์นิเจอร์", ...(details.appliances || [])].join(" · ")}</dd>
            <dt>สิ่งอำนวยความสะดวก</dt><dd>{(details.facilities || []).join(" · ") || "ไม่ได้ระบุ"}</dd>
            <dt>การเลี้ยงสัตว์</dt><dd>{details.pets ? "อนุญาต" : "ไม่อนุญาต"}</dd>
            <dt>ผู้ติดต่อ</dt><dd>{[details.contactName, details.contactPhone, details.contactEmail, details.lineId && `LINE: ${details.lineId}`].filter(Boolean).join(" · ") || "ไม่ได้ระบุ"}</dd>
            <dt>ผู้ลงประกาศ</dt><dd>{listing.owner_email || "บัญชีผู้ใช้เดิม"}</dd>
            <dt>รายละเอียดเพิ่มเติม</dt><dd>{details.description || "ไม่ได้ระบุ"}</dd>
            <dt>จุดเด่น</dt><dd>{(details.highlights || []).join(" · ") || "ไม่ได้ระบุ"}</dd>
          </dl>
          <div className="admin-review-modal-actions">
            <span>โปรดตรวจข้อมูลและรูปภาพก่อนยืนยัน</span>
            <button className="btn" type="button" disabled={approving} onClick={onApprove}>
              {approving ? "กำลังดำเนินการ..." : "ตรวจสอบแล้ว · ยืนยันเผยแพร่"}
            </button>
          </div>
        </div>
      </section>
    </div>
    </Localized>
  );
}
