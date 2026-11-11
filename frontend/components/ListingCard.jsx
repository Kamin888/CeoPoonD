import React from "react";

export default function ListingCard({ listing, roomStatusLabels, onOpen }) {
  return (
    <article
      className="card listing-card-clickable"
      role="button"
      tabIndex={0}
      aria-label={`ดูรายละเอียด ${listing.name}`}
      onClick={() => onOpen(listing)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(listing);
        }
      }}
    >
      <div
        className="ph"
        style={listing.details?.images?.[0] ? {
          backgroundImage: `url("${listing.details.images[0]}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : undefined}
      >
        {!listing.details?.images?.[0] && <span className="photo-placeholder" aria-hidden="true">⌂</span>}
        <span className="tag">{listing.available ? "พร้อมเข้าอยู่" : listing.details?.listingType === "sale" ? "ประกาศขาย" : "ให้เช่า"}</span>
      </div>
      <div className="b">
        <h3>{listing.name}</h3>
        <small className="card-location"><span aria-hidden="true">⌖</span> {listing.area}</small>
        <div className="card-footer">
          <div className="price">{listing.price.toLocaleString("th-TH")} <span>{listing.details?.listingType === "sale" ? "บาท" : "บาท/เดือน"}</span></div>
          <span className="card-details-link" aria-hidden="true">↗</span>
        </div>
        <small className={`room-status-label room-status-${listing.room_status || "vacant"}`}>
          สถานะห้อง: {roomStatusLabels[listing.room_status] || "ว่าง"}
        </small>
        <small className="listing-owner">ลงประกาศโดย {listing.owner_email || "สมาชิกหอหา"}</small>
      </div>
    </article>
  );
}
