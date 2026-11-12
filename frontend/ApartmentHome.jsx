import React, { useEffect, useState } from "react";
import "./ApartmentHome.css";
import { Localized, translateText } from "./i18n.js";
import AuthScreen from "./components/AuthScreen.jsx";
import AdminReviewModal from "./components/AdminReviewModal.jsx";
import ListingDetailsModal from "./components/ListingDetailsModal.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";

const EMPTY_LISTING = {
  listingType: "rent",
  propertyType: "condo",
  otherPropertyType: "",
  projectName: "",
  province: "",
  district: "",
  subdistrict: "",
  road: "",
  nearby: "",
  bedrooms: "",
  bathrooms: "",
  floor: "",
  areaSqm: "",
  parking: "",
  price: "",
  deposit: "",
  advanceRent: "",
  minContract: "",
  tenantContractEndDate: "",
  availableDate: "",
  furnished: "none",
  appliances: [],
  facilities: [],
  pets: false,
  transit: false,
  description: "",
  highlights: [],
  images: [],
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  lineId: "",
};

const LISTING_STEPS = ["ทำเลและประเภท", "รายละเอียดและราคา", "สิ่งอำนวยความสะดวก", "ตรวจทาน"];
const STATUS_LABELS = {
  draft: "ฉบับร่าง",
  pending_review: "รอตรวจสอบ",
  published: "เผยแพร่แล้ว",
  closed: "ปิดประกาศ",
};
const ROOM_STATUS_LABELS = {
  vacant: "ว่าง",
  occupied: "ไม่ว่าง",
};

function getLocalDateString() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatListingTimestamp(value, language) {
  if (!value) return translateText(language, "ไม่ระบุ");
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return translateText(language, "ไม่ระบุ");
  return date.toLocaleString(language === "en" ? "en-US" : "th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value, language) {
  return Number(value).toLocaleString(language === "en" ? "en-US" : "th-TH");
}

function formatListingCode(id, prefix) {
  return prefix ? `${prefix}${String(id).padStart(4, "0")}` : "—";
}

function escapeXml(value) {
  return String(value ?? "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createListingsExcelXml(listings, language, prefix) {
  const columns = [
    ["รหัส", (listing) => formatListingCode(listing.id, prefix)],
    ["สถานะ", (listing) => translateText(language, STATUS_LABELS[listing.status] || listing.status)],
    ["สถานะผู้เช่า", (listing) => translateText(language, ROOM_STATUS_LABELS[listing.room_status] || "ว่าง")],
    ["ประเภทประกาศ", (listing) => translateText(language, listing.details?.listingType === "sale" ? "ขาย" : "ให้เช่า")],
    ["ชื่อโครงการ", (listing) => listing.name],
    ["ประเภททรัพย์", (listing) => ({
      condo: translateText(language, "คอนโด"),
      apartment: translateText(language, "อพาร์ตเมนต์"),
      house: translateText(language, "บ้าน"),
      townhome: translateText(language, "ทาวน์โฮม"),
      land: translateText(language, "ที่ดิน"),
      other: listing.details?.otherPropertyType,
    }[listing.details?.propertyType] || listing.details?.otherPropertyType || "")],
    ["ชื่อโครงการ", (listing) => listing.details?.projectName],
    ["จังหวัด", (listing) => listing.details?.province],
    ["เขต/อำเภอ", (listing) => listing.details?.district],
    ["แขวง/ตำบล", (listing) => listing.details?.subdistrict],
    ["ถนน/ซอย", (listing) => listing.details?.road],
    ["สถานที่ใกล้เคียง", (listing) => listing.details?.nearby],
    ["ทำเล", (listing) => listing.area],
    ["ราคา (บาท)", (listing) => listing.price],
    ["พื้นที่ (ตร.ม.)", (listing) => listing.details?.areaSqm],
    ["ห้องนอน", (listing) => listing.details?.bedrooms],
    ["ห้องน้ำ", (listing) => listing.details?.bathrooms],
    ["ชั้น", (listing) => listing.details?.floor],
    ["ที่จอดรถ", (listing) => listing.details?.parking],
    ["เงินประกัน (บาท)", (listing) => listing.details?.deposit],
    ["ค่าเช่าล่วงหน้า (เดือน)", (listing) => listing.details?.advanceRent],
    ["สัญญาขั้นต่ำ (เดือน)", (listing) => listing.details?.minContract],
    ["วันหมดสัญญาเช่า", (listing) => listing.details?.tenantContractEndDate],
    ["วันที่พร้อมเข้าอยู่/ขาย", (listing) => listing.details?.availableDate],
    ["เฟอร์นิเจอร์", (listing) => ({
      none: translateText(language, "ไม่มี"),
      partial: translateText(language, "บางส่วน"),
      fully: translateText(language, "ครบ"),
    }[listing.details?.furnished] || listing.details?.furnished)],
    ["เครื่องใช้ไฟฟ้า", (listing) => listing.details?.appliances?.map((item) => translateText(language, item)).join(", ")],
    ["สิ่งอำนวยความสะดวก", (listing) => listing.details?.facilities?.map((item) => translateText(language, item)).join(", ")],
    ["เลี้ยงสัตว์", (listing) => translateText(language, (listing.details?.pets ?? listing.pets) ? "อนุญาต" : "ไม่อนุญาต")],
    ["ใกล้ BTS/MRT", (listing) => translateText(language, (listing.details?.transit ?? listing.transit) ? "ใช่" : "ไม่ใช่")],
    ["รายละเอียด", (listing) => listing.details?.description],
    ["จุดเด่น", (listing) => listing.details?.highlights?.join(", ")],
    ["รูปภาพ", (listing) => (listing.details?.images || []).map((image, index) =>
      image.startsWith("data:") ? translateText(language, `รูปที่ ${index + 1} (แนบในระบบ)`) : image
    ).join("\n")],
    ["ชื่อผู้ติดต่อ", (listing) => listing.details?.contactName],
    ["เบอร์โทร", (listing) => listing.details?.contactPhone],
    ["อีเมลติดต่อ", (listing) => listing.details?.contactEmail],
    ["LINE ID", (listing) => listing.details?.lineId],
    ["อีเมลบัญชีผู้ลงประกาศ", (listing) => listing.owner_email],
    ["วันที่สร้าง", (listing) => listing.created_at],
    ["วันที่แก้ไขล่าสุด", (listing) => listing.updated_at],
  ];
  const cell = (value, style = "") =>
    `<Cell${style ? ` ss:StyleID="${style}"` : ""}><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`;
  const headerRow = `<Row>${columns.map(([label]) => cell(translateText(language, label), "Header")).join("")}</Row>`;
  const dataRows = listings.map((listing) =>
    `<Row>${columns.map(([, getValue]) => cell(getValue(listing))).join("")}</Row>`
  ).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles><Style ss:ID="Header"><Font ss:Bold="1"/><Interior ss:Color="#DCE8DF" ss:Pattern="Solid"/></Style></Styles>
  <Worksheet ss:Name="${translateText(language, "ข้อมูลโครงการ")}"><Table>${headerRow}${dataRows}</Table></Worksheet>
</Workbook>`;
}

export default function ApartmentHome() {
  const [language, setLanguage] = useState("th");
  const [theme, setTheme] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [session, setSession] = useState(null);
  const [notice, setNotice] = useState("");
  const [listingMode, setListingMode] = useState(false);
  const [listingForm, setListingForm] = useState(EMPTY_LISTING);
  const [listingId, setListingId] = useState(null);
  const [listingRoomStatus, setListingRoomStatus] = useState("vacant");
  const [listingEditStatus, setListingEditStatus] = useState(null);
  const [adminEditingListing, setAdminEditingListing] = useState(false);
  const [listingStep, setListingStep] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const [listingError, setListingError] = useState("");
  const [listingLoading, setListingLoading] = useState(false);
  const [listingRefresh, setListingRefresh] = useState(0);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [adminListings, setAdminListings] = useState([]);
  const [adminListingsError, setAdminListingsError] = useState("");
  const [adminExportError, setAdminExportError] = useState("");
  const [listingCodePrefix, setListingCodePrefix] = useState("");
  const [listingCodePrefixLoading, setListingCodePrefixLoading] = useState(true);
  const [listingCodePrefixError, setListingCodePrefixError] = useState("");
  const [trashedListings, setTrashedListings] = useState([]);
  const [trashError, setTrashError] = useState("");
  const [adminSection, setAdminSection] = useState("all");
  const [adminRoomStatusFilter, setAdminRoomStatusFilter] = useState("all");
  const [adminMinPriceFilter, setAdminMinPriceFilter] = useState("");
  const [adminMaxPriceFilter, setAdminMaxPriceFilter] = useState("");
  const [adminNameFilter, setAdminNameFilter] = useState("");
  const [updatingRoomStatusId, setUpdatingRoomStatusId] = useState(null);
  const [reviewError, setReviewError] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [approvingListingId, setApprovingListingId] = useState(null);
  const [adminDashboard, setAdminDashboard] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);
  const [pendingReviewListing, setPendingReviewListing] = useState(null);
  const [detailImageIndex, setDetailImageIndex] = useState(0);

  const toggleLanguage = () => setLanguage((current) => current === "th" ? "en" : "th");
  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");
  const t = (text) => translateText(language, text);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "en" ? "Finzhome Admin Dashboard" : "Finzhome แดชบอร์ดผู้ดูแล";
  }, [language]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  const normalizedAdminNameFilter = adminNameFilter.trim().toLocaleLowerCase();
  const visibleAdminListings = adminListings.filter((listing) => listing.status !== "pending_review");
  const filteredAdminListings = visibleAdminListings.filter((listing) => {
    const matchesName = !normalizedAdminNameFilter ||
      listing.name.toLocaleLowerCase().includes(normalizedAdminNameFilter);
    const matchesRoomStatus = adminRoomStatusFilter === "all" ||
      (listing.room_status || "vacant") === adminRoomStatusFilter;
    const matchesMinPrice = adminMinPriceFilter === "" || listing.price >= Number(adminMinPriceFilter);
    const matchesMaxPrice = adminMaxPriceFilter === "" || listing.price <= Number(adminMaxPriceFilter);
    return matchesName && matchesRoomStatus && matchesMinPrice && matchesMaxPrice;
  });

  const goDashboard = () => {
    setAdminDashboard(true);
    setListingMode(false);
    setSelectedListing(null);
    setNotice("");
  };

  const openListingDetails = (listing) => {
    setSelectedListing(listing);
    setDetailImageIndex(0);
  };

  useEffect(() => {
    if (!selectedListing && !pendingReviewListing) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedListing(null);
        setPendingReviewListing(null);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedListing, pendingReviewListing]);

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: authForm.email, password: authForm.password }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "ไม่สามารถดำเนินการได้ กรุณาลองอีกครั้ง");
      }

      setSession(result.user);
      setNotice("เข้าสู่ระบบสำเร็จ");
    } catch (requestError) {
      setAuthError(requestError.message || "ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const apiUrl = import.meta.env.VITE_API_URL || "";

    async function restoreSession() {
      try {
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          credentials: "include",
          signal: controller.signal,
        });
        if (response.status === 401) return;
        if (!response.ok) throw new Error("ตรวจสอบสถานะบัญชีไม่สำเร็จ");
        const result = await response.json();
        setSession(result.user);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setNotice(requestError.message || "ตรวจสอบสถานะบัญชีไม่สำเร็จ");
        }
      }
    }

    restoreSession();
    return () => controller.abort();
  }, []);

  const logout = async () => {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    try {
      const response = await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) throw new Error("ออกจากระบบไม่สำเร็จ กรุณาลองอีกครั้ง");
      setSession(null);
      setNotice("ออกจากระบบแล้ว");
    } catch (requestError) {
      setNotice(requestError.message || "ออกจากระบบไม่สำเร็จ");
    }
  };

  const validateListing = () => {
    const errors = [];
    if (!listingForm.projectName.trim()) errors.push("กรุณากรอกชื่อโครงการหรือชื่อทรัพย์");
    if (listingForm.propertyType === "other" && !listingForm.otherPropertyType.trim()) {
      errors.push("กรุณาระบุประเภททรัพย์");
    }
    ["province", "district", "subdistrict"].forEach((field) => {
      if (!listingForm[field].trim()) {
        const labels = { province: "จังหวัด", district: "เขต/อำเภอ", subdistrict: "แขวง/ตำบล" };
        errors.push(`กรุณากรอก${labels[field]}`);
      }
    });
    if (!listingForm.price || !Number.isSafeInteger(Number(listingForm.price)) || Number(listingForm.price) <= 0) {
      errors.push("กรุณากรอกราคาที่ถูกต้องและมากกว่า 0 บาท");
    }
    if (!listingForm.areaSqm || Number(listingForm.areaSqm) <= 0) errors.push("กรุณากรอกพื้นที่ใช้สอย");
    if (listingRoomStatus === "occupied" && !listingForm.tenantContractEndDate) {
      errors.push("กรุณาระบุวันหมดสัญญาเช่าของผู้เช่า");
    }
    if (!listingForm.availableDate) errors.push("กรุณาระบุวันที่พร้อมเข้าอยู่หรือพร้อมขาย");
    if (!listingForm.images.length) errors.push("กรุณาอัปโหลดรูปภาพจริงของทรัพย์อย่างน้อย 1 รูป");
    if (!listingForm.contactName.trim()) errors.push("กรุณากรอกชื่อผู้ติดต่อ");
    if (!listingForm.contactPhone.trim()) errors.push("กรุณากรอกเบอร์โทรศัพท์ผู้ติดต่อ");
    if (listingForm.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(listingForm.contactEmail)) {
      errors.push("กรุณากรอกอีเมลสำหรับติดต่อให้ถูกต้อง");
    }
    return errors;
  };

  const saveListing = async (status) => {
    setValidationErrors([]);
    if (status === "pending_review") {
      const errors = validateListing();
      if (errors.length) {
        setValidationErrors(errors);
        setListingError("กรุณาตรวจสอบข้อมูลที่จำเป็นก่อนส่งประกาศ");
        return;
      }
    }
    setListingError("");
    setListingLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const payload = {
        ...listingForm,
        room_status: listingRoomStatus,
        status,
        price: listingForm.price ? Number(listingForm.price) : 0,
        name: listingForm.projectName.trim() || "ประกาศฉบับร่าง",
        area: [listingForm.subdistrict, listingForm.district, listingForm.province].filter(Boolean).join(" ").slice(0, 160),
        available: Boolean(listingForm.availableDate && listingForm.availableDate <= getLocalDateString()),
      };
      const endpoint = adminEditingListing && listingId
        ? `${apiUrl}/api/admin/listings/${listingId}`
        : `${apiUrl}/api/listings${listingId ? `/${listingId}` : ""}`;
      const response = await fetch(endpoint, {
        method: listingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "บันทึกประกาศไม่สำเร็จ กรุณาลองอีกครั้ง");
      }

      setListingMode(false);
      setListingId(null);
      setListingEditStatus(null);
      setAdminEditingListing(false);
      setAdminDashboard(adminEditingListing);
      setListingRefresh((count) => count + 1);
      setNotice(
        (listingEditStatus === "published" || listingEditStatus === "closed") && status === "pending_review"
          ? "ส่งข้อมูลแก้ไขแล้ว ประกาศถูกตั้งเป็นรอตรวจสอบและจะเผยแพร่อีกครั้งหลังผู้ดูแลอนุมัติ"
          : status === "draft"
            ? "บันทึกฉบับร่างแล้ว"
            : "ส่งประกาศเรียบร้อยแล้ว สถานะ: รอตรวจสอบ"
      );
    } catch (requestError) {
      setListingError(requestError.message || "ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setListingLoading(false);
    }
  };

  const submitListing = (event) => {
    event.preventDefault();
    if (listingStep < LISTING_STEPS.length - 1) {
      setListingError("กรุณากดปุ่มถัดไปเพื่อตรวจสอบข้อมูลในขั้นตอนนี้");
      return;
    }
    saveListing("pending_review");
  };

  useEffect(() => {
    if (session?.role !== "admin") {
      setAdminListings([]);
      setAdminListingsError("");
      setTrashedListings([]);
      setTrashError("");
      return;
    }
    const controller = new AbortController();
    async function loadAdminListings() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${apiUrl}/api/admin/listings`, {
          credentials: "include",
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "โหลดข้อมูลโครงการไม่สำเร็จ");
        setAdminListings(result.data);
        setAdminListingsError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setAdminListingsError(requestError.message || "ไม่สามารถเชื่อมต่อระบบได้");
        }
      }
    }
    loadAdminListings();
    return () => controller.abort();
  }, [session, listingRefresh]);

  useEffect(() => {
    if (session?.role !== "admin") {
      setListingCodePrefixLoading(false);
      setListingCodePrefixError("");
      return undefined;
    }
    const controller = new AbortController();
    async function loadListingCodePrefix() {
      setListingCodePrefixLoading(true);
      setListingCodePrefixError("");
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${apiUrl}/api/admin/settings/listing-code-prefix`, {
          credentials: "include",
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "โหลดคำนำหน้ารหัสไม่สำเร็จ");
        const prefix = result.data?.prefix;
        if (typeof prefix !== "string" || !/^[A-Z]{1,10}$/.test(prefix)) {
          throw new Error("คำนำหน้ารหัสที่ได้รับไม่ถูกต้อง");
        }
        setListingCodePrefix(prefix);
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setListingCodePrefixError(requestError.message || "โหลดคำนำหน้ารหัสไม่สำเร็จ");
        }
      } finally {
        if (!controller.signal.aborted) setListingCodePrefixLoading(false);
      }
    }
    loadListingCodePrefix();
    return () => controller.abort();
  }, [session]);

  useEffect(() => {
    if (session?.role !== "admin") return undefined;
    const controller = new AbortController();
    async function loadTrash() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${apiUrl}/api/admin/listings/trash`, {
          credentials: "include",
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "โหลดถังขยะไม่สำเร็จ");
        setTrashedListings(result.data);
        setTrashError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setTrashError(requestError.message || "ไม่สามารถเชื่อมต่อระบบได้");
        }
      }
    }
    loadTrash();
    return () => controller.abort();
  }, [session, listingRefresh]);

  useEffect(() => {
    if (session?.role !== "admin") {
      setPendingReviews([]);
      setReviewError("");
      setReviewLoading(false);
      return;
    }
    const controller = new AbortController();
    async function loadPendingReviews() {
      setReviewLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${apiUrl}/api/admin/listings/pending`, {
          credentials: "include",
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "โหลดคิวตรวจสอบไม่สำเร็จ");
        setPendingReviews(result.data);
        setReviewError("");
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setReviewError(requestError.message || "ไม่สามารถเชื่อมต่อระบบตรวจสอบได้");
        }
      } finally {
        if (!controller.signal.aborted) setReviewLoading(false);
      }
    }
    loadPendingReviews();
    return () => controller.abort();
  }, [session, listingRefresh]);

  const approveListing = async (id) => {
    const listing = pendingReviews.find((item) => item.id === id);
    if (!window.confirm(t(`ยืนยันอนุมัติ “${listing?.name || "ประกาศนี้"}” และเผยแพร่ต่อสาธารณะหรือไม่?`))) {
      return;
    }
    setApprovingListingId(id);
    setReviewError("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/admin/listings/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "อนุมัติประกาศไม่สำเร็จ");
      const approvedListing = pendingReviews.find((listing) => listing.id === id);
      setNotice(`อนุมัติประกาศ “${approvedListing?.name || "ประกาศ"}” และเผยแพร่แล้ว`);
      setListingRefresh((count) => count + 1);
    } catch (requestError) {
      setReviewError(requestError.message || "ไม่สามารถเชื่อมต่อระบบตรวจสอบได้");
    } finally {
      setApprovingListingId(null);
    }
  };

  const updateRoomStatus = async (listing, roomStatus) => {
    setAdminListingsError("");
    setUpdatingRoomStatusId(listing.id);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/admin/listings/${listing.id}/room-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ room_status: roomStatus }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "เปลี่ยนสถานะห้องไม่สำเร็จ");
      setListingRefresh((count) => count + 1);
    } catch (requestError) {
      setAdminListingsError(requestError.message || "ไม่สามารถเชื่อมต่อระบบได้");
    } finally {
      setUpdatingRoomStatusId(null);
    }
  };

  const editAdminListing = (listing) => {
    setListingId(listing.id);
    setListingRoomStatus(listing.room_status || "vacant");
    setListingEditStatus(listing.status);
    setAdminEditingListing(true);
    setListingForm({ ...EMPTY_LISTING, ...(listing.details || {}) });
    setListingStep(0);
    setValidationErrors([]);
    setListingError("");
    setAdminDashboard(false);
    setListingMode(true);
  };

  const createAdminListing = () => {
    setListingId(null);
    setListingRoomStatus("vacant");
    setListingEditStatus(null);
    setAdminEditingListing(true);
    setListingForm({ ...EMPTY_LISTING });
    setListingStep(0);
    setValidationErrors([]);
    setListingError("");
    setAdminDashboard(false);
    setListingMode(true);
  };

  const deleteAdminListing = async (listing) => {
    if (!window.confirm(t(`ย้ายประกาศ “${listing.name}” ของ ${listing.owner_email || "บัญชีเดิม"} ไปถังขยะหรือไม่? ระบบจะลบถาวรหลัง 15 วัน`))) {
      return;
    }
    setAdminListingsError("");
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/admin/listings/${listing.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "ลบประกาศไม่สำเร็จ");
      }
      setNotice(`ย้ายประกาศ “${listing.name}” ไปถังขยะแล้ว จะลบถาวรเมื่อครบ 15 วัน`);
      setListingRefresh((count) => count + 1);
    } catch (requestError) {
      setAdminListingsError(requestError.message || "ไม่สามารถเชื่อมต่อระบบได้");
    }
  };

  const restoreAdminListing = async (listing) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/admin/listings/${listing.id}/restore`, {
        method: "PATCH",
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "กู้คืนประกาศไม่สำเร็จ");
      setNotice(`กู้คืนประกาศ “${listing.name}” แล้ว`);
      setListingRefresh((count) => count + 1);
    } catch (requestError) {
      setTrashError(requestError.message || "ไม่สามารถเชื่อมต่อระบบได้");
    }
  };

  const permanentlyDeleteAdminListing = async (listing) => {
    if (!window.confirm(t(`ลบประกาศ “${listing.name}” ถาวรทันที? การดำเนินการนี้ย้อนกลับไม่ได้`))) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/admin/listings/${listing.id}/permanent`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "ลบประกาศถาวรไม่สำเร็จ");
      }
      setNotice(`ลบประกาศ “${listing.name}” ถาวรแล้ว`);
      setListingRefresh((count) => count + 1);
    } catch (requestError) {
      setTrashError(requestError.message || "ไม่สามารถเชื่อมต่อระบบได้");
    }
  };

  const exportAdminListings = () => {
    setAdminExportError("");
    try {
      const workbook = createListingsExcelXml(filteredAdminListings, language, listingCodePrefix);
      const blob = new Blob(["\uFEFF", workbook], { type: "application/vnd.ms-excel;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ceopoon-listings-${getLocalDateString()}.xls`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (exportError) {
      console.error("Failed to export listings:", exportError);
      setAdminExportError("ส่งออกไฟล์ Excel ไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  };

  if (adminDashboard && session?.role === "admin") {
    return (
      <Localized language={language}>
      <div className={`ah${adminSection === "all" || adminSection === "pending" || adminSection === "trash" ? " admin-table-view" : ""}`}>
        <div className="wrap admin-dashboard">
          <header>
            <button className="logo logo-button" type="button" onClick={goDashboard} aria-label="Finzhome แดชบอร์ด">Finzhome<small> ADMIN</small></button>
            <nav>
              <span className="user-email">{session.email}</span>
              <ThemeToggle theme={theme} language={language} onToggle={toggleTheme} />
              <button className="nav-link" type="button" onClick={toggleLanguage}>{language === "th" ? "English" : "ไทย"}</button>
              <button className="nav-link" onClick={logout}>ออกจากระบบ</button>
            </nav>
          </header>
          <main>
            <section className="admin-dashboard-heading">
              <span className="eyebrow">ADMIN DASHBOARD</span>
              <h1>{adminSection === "pending" ? "รอตรวจสอบ" : adminSection === "trash" ? "ถังขยะ" : "ข้อมูลโครงการ"}</h1>
              <p>{adminSection === "pending"
                ? "ตรวจรายละเอียดและรูปภาพก่อนยืนยันเผยแพร่"
                : adminSection === "trash"
                  ? "กู้คืนประกาศได้ภายใน 15 วัน ก่อนลบออกจากระบบถาวร"
                  : "จัดการ แก้ไข และย้ายประกาศทุกบัญชีไปยังถังขยะ"}</p>
            </section>
            <div className="admin-dashboard-grid">
              <aside className="admin-sidebar" aria-label="หมวดหมู่แดชบอร์ด">
                <span className="admin-sidebar-label">จัดการประกาศ</span>
                <button className={adminSection === "all" ? "active" : ""} onClick={() => setAdminSection("all")}>
                  <span>ข้อมูลโครงการ</span><strong>{visibleAdminListings.length}</strong>
                </button>
                <button className={adminSection === "trash" ? "active" : ""} onClick={() => setAdminSection("trash")}>
                  <span>ถังขยะ</span><strong>{trashedListings.length}</strong>
                </button>
                <button className={adminSection === "pending" ? "active" : ""} onClick={() => setAdminSection("pending")}>
                  <span>รอตรวจสอบ</span><strong>{pendingReviews.length}</strong>
                </button>
              </aside>
              <div className="admin-dashboard-content">
                <section className="admin-summary" aria-label="สรุปประกาศ">
                  <div><span>รอตรวจสอบ</span><strong>{pendingReviews.length}</strong></div>
                  <div><span>ประกาศที่ใช้งาน</span><strong>{visibleAdminListings.length}</strong></div>
                  <div><span>ในถังขยะ</span><strong>{trashedListings.length}</strong></div>
                </section>
                {adminSection === "pending" && reviewError && <p className="form-error" role="alert">{reviewError}</p>}
                {adminSection === "pending" && reviewLoading ? (
              <p className="empty" role="status">กำลังโหลดคิวตรวจสอบ...</p>
            ) : adminSection === "pending" && !reviewError && pendingReviews.length === 0 ? (
              <section className="admin-empty">
                <span aria-hidden="true">✓</span>
                <h2>ไม่มีประกาศค้างตรวจ</h2>
                <p>เมื่อมีผู้ส่งประกาศเข้ามา รายการจะแสดงในหน้านี้</p>
              </section>
            ) : adminSection === "pending" && !reviewError ? (
              <section className="admin-manage-all" aria-label="รายการรอตรวจสอบ">
                <div className="admin-manage-heading">
                  <span className="status-badge">{pendingReviews.length} รายการ</span>
                </div>
                <div className="admin-listings-table-wrap">
                  <table className="admin-listings-table">
                    <thead>
                      <tr>
                        <th scope="col">รหัส</th>
                        <th scope="col">ชื่อโครงการ</th>
                        <th scope="col">ราคา</th>
                        <th scope="col">สถานะ</th>
                        <th scope="col">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingReviews.map((listing) => {
                        const details = listing.details || {};
                        return (
                          <tr key={listing.id}>
                            <td><span className="admin-project-code">{formatListingCode(listing.id, listingCodePrefix)}</span></td>
                            <th scope="row">
                              <div className="admin-table-listing">
                                {details.images?.[0] ? (
                                  <img src={details.images[0]} alt="" />
                                ) : (
                                  <div className="admin-table-placeholder">ไม่มีรูป</div>
                                )}
                                <div className="admin-table-details">
                                  <button
                                    className="admin-table-name-button"
                                    type="button"
                                    aria-haspopup="dialog"
                                    onClick={() => setPendingReviewListing(listing)}
                                  >{listing.name}</button>
                                  <div className="admin-table-timestamp">ผู้โพสต์: {listing.owner_email || "บัญชีผู้ใช้เดิม"}</div>
                                </div>
                              </div>
                            </th>
                            <td>{formatNumber(listing.price, language)} บาท{details.listingType === "sale" ? "" : "/เดือน"}</td>
                            <td><span className="status-badge status-pending_review">รอตรวจสอบ</span></td>
                            <td>
                              <button
                                className="secondary-button"
                                disabled={approvingListingId === listing.id}
                                onClick={() => approveListing(listing.id)}
                              >
                                {approvingListingId === listing.id ? "กำลังดำเนินการ..." : "ตรวจสอบแล้ว · ยืนยันเผยแพร่"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            ) : null}
            {adminSection === "all" && <section className="admin-manage-all" aria-label="ข้อมูลโครงการ">
              <div className="admin-manage-heading">
                <div className="admin-manage-heading-actions">
                  <span className="status-badge">{filteredAdminListings.length} / {visibleAdminListings.length} รายการ</span>
                  <button
                    className="secondary-button admin-export-button"
                    type="button"
                    onClick={exportAdminListings}
                    disabled={filteredAdminListings.length === 0 || Boolean(adminListingsError) || listingCodePrefixLoading || Boolean(listingCodePrefixError)}
                  >
                    <span aria-hidden="true">↓</span> ดาวน์โหลด Excel
                  </button>
                  <button
                    className="secondary-button admin-create-listing-button"
                    type="button"
                    onClick={createAdminListing}
                  >
                    ลงข้อมูล
                  </button>
                </div>
              </div>
              {listingCodePrefixError && <p className="form-error" role="alert">{listingCodePrefixError}</p>}
              {adminListingsError && <p className="form-error" role="alert">{adminListingsError}</p>}
              {adminExportError && <p className="form-error" role="alert">{adminExportError}</p>}
              <div className="admin-listing-filters" aria-label="ตัวกรองประกาศ">
                <label>
                  ชื่อโครงการ
                  <input
                    type="search"
                    value={adminNameFilter}
                    onChange={(event) => setAdminNameFilter(event.target.value)}
                    placeholder="ค้นหาชื่อ"
                  />
                </label>
                <label>
                  สถานะห้อง
                  <select value={adminRoomStatusFilter} onChange={(event) => setAdminRoomStatusFilter(event.target.value)}>
                    <option value="all">ทั้งหมด</option>
                    <option value="vacant">ว่าง</option>
                    <option value="occupied">ไม่ว่าง</option>
                  </select>
                </label>
                <label>
                  ราคาตั้งแต่ (บาท)
                  <input
                    type="number"
                    min="0"
                    value={adminMinPriceFilter}
                    onChange={(event) => setAdminMinPriceFilter(event.target.value)}
                    placeholder="ไม่กำหนด"
                  />
                </label>
                <label>
                  ราคาสูงสุด (บาท)
                  <input
                    type="number"
                    min="0"
                    value={adminMaxPriceFilter}
                    onChange={(event) => setAdminMaxPriceFilter(event.target.value)}
                    placeholder="ไม่กำหนด"
                  />
                </label>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    setAdminNameFilter("");
                    setAdminRoomStatusFilter("all");
                    setAdminMinPriceFilter("");
                    setAdminMaxPriceFilter("");
                  }}
                  disabled={!adminNameFilter && adminRoomStatusFilter === "all" && !adminMinPriceFilter && !adminMaxPriceFilter}
                >
                  ล้างตัวกรอง
                </button>
              </div>
              {!adminListingsError && visibleAdminListings.length === 0 ? (
                <p className="empty">ยังไม่มีประกาศในระบบ</p>
              ) : (
                <div className="admin-listings-table-wrap">
                  {filteredAdminListings.length === 0 ? (
                    <p className="empty">ไม่พบประกาศที่ตรงกับตัวกรอง</p>
                  ) : (
                    <table className="admin-listings-table">
                      <thead>
                        <tr>
                          <th scope="col">รหัส</th>
                          <th scope="col">ชื่อ</th>
                          <th scope="col">ราคา</th>
                          <th scope="col">สถานะ</th>
                          <th scope="col">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAdminListings.map((listing) => (
                          <tr key={listing.id}>
                            <td><span className="admin-project-code">{formatListingCode(listing.id, listingCodePrefix)}</span></td>
                            <th scope="row">
                              <div className="admin-table-listing">
                                {listing.details?.images?.[0] ? (
                                  <img src={listing.details.images[0]} alt="" />
                                ) : (
                                  <div className="admin-table-placeholder">ไม่มีรูป</div>
                                )}
                                <div className="admin-table-details">
                                  <button
                                    className="admin-table-name-button"
                                    type="button"
                                    aria-haspopup="dialog"
                                    onClick={() => openListingDetails(listing)}
                                  >{listing.name}</button>
                                  <div className="admin-table-timestamp">ลงประกาศ: {formatListingTimestamp(listing.created_at, language)}</div>
                                  <div className="admin-table-timestamp">แก้ไขล่าสุด: {formatListingTimestamp(listing.updated_at, language)}</div>
                                </div>
                              </div>
                            </th>
                            <td>{formatNumber(listing.price, language)} บาท</td>
                            <td>
                              <label className="admin-room-status">
                                <select
                                  aria-label={`สถานะห้องของ ${listing.name}`}
                                  value={listing.room_status || "vacant"}
                                  onChange={(event) => updateRoomStatus(listing, event.target.value)}
                                  disabled={updatingRoomStatusId === listing.id}
                                >
                                  <option value="vacant">ว่าง</option>
                                  <option value="occupied">ไม่ว่าง</option>
                                </select>
                              </label>
                            </td>
                            <td>
                              <div className="admin-manage-actions">
                                <button className="secondary-button" onClick={() => editAdminListing(listing)}>แก้ไข</button>
                                <button className="danger-button" onClick={() => deleteAdminListing(listing)}>ย้ายไปถังขยะ</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </section>}
            {adminSection === "trash" && (
              <section className="admin-manage-all" aria-labelledby="admin-trash-title">
                <div className="admin-manage-heading">
                  <div>
                    <h2 id="admin-trash-title">ถังขยะ</h2>
                    <p>ประกาศจะถูกลบถาวรโดยอัตโนมัติหลังย้ายเข้าถังขยะครบ 15 วัน</p>
                  </div>
                  <span className="status-badge">{trashedListings.length} รายการ</span>
                </div>
                {trashError && <p className="form-error" role="alert">{trashError}</p>}
                {!trashError && trashedListings.length === 0 ? (
                  <section className="admin-empty">
                    <span aria-hidden="true">✓</span>
                    <h2>ถังขยะว่าง</h2>
                    <p>ประกาศที่ย้ายไปถังขยะจะแสดงที่นี่นาน 15 วัน</p>
                  </section>
                ) : (
                  <div className="admin-listings-table-wrap">
                    <table className="admin-listings-table">
                      <thead>
                        <tr>
                          <th scope="col">รหัส</th>
                          <th scope="col">ชื่อ</th>
                          <th scope="col">ราคา</th>
                          <th scope="col">สถานะ</th>
                          <th scope="col">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trashedListings.map((listing) => (
                          <tr key={listing.id}>
                            <td><span className="admin-project-code">{formatListingCode(listing.id, listingCodePrefix)}</span></td>
                            <th scope="row">
                              <div className="admin-table-listing">
                                {listing.details?.images?.[0] ? (
                                  <img src={listing.details.images[0]} alt="" />
                                ) : (
                                  <div className="admin-table-placeholder">ไม่มีรูป</div>
                                )}
                                <div className="admin-table-details">
                                  <button
                                    className="admin-table-name-button"
                                    type="button"
                                    aria-haspopup="dialog"
                                    onClick={() => openListingDetails(listing)}
                                  >{listing.name}</button>
                                  <div className="admin-table-timestamp">{listing.area || "ไม่ได้ระบุทำเล"}</div>
                                  <div className="admin-table-timestamp">ผู้โพสต์: {listing.owner_email || "บัญชีผู้ใช้เดิม"}</div>
                                </div>
                              </div>
                            </th>
                            <td>{formatNumber(listing.price, language)} บาท</td>
                            <td>
                              <span className="status-badge">ถังขยะ</span>
                              <div className="admin-table-timestamp">ลบถาวรวันที่ {new Date(listing.expires_at).toLocaleString(language === "en" ? "en-US" : "th-TH")}</div>
                            </td>
                            <td>
                              <div className="admin-manage-actions">
                                <button className="secondary-button" onClick={() => restoreAdminListing(listing)}>กู้คืน</button>
                                <button className="danger-button" onClick={() => permanentlyDeleteAdminListing(listing)}>ลบถาวร</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}
              </div>
            </div>
          </main>
        </div>
        {selectedListing && (
          <ListingDetailsModal
            listing={selectedListing}
            imageIndex={detailImageIndex}
            setImageIndex={setDetailImageIndex}
            roomStatusLabels={ROOM_STATUS_LABELS}
            language={language}
            listingCode={formatListingCode(selectedListing.id, listingCodePrefix)}
            onClose={() => setSelectedListing(null)}
          />
        )}
        {pendingReviewListing && (
          <AdminReviewModal
            listing={pendingReviewListing}
            onClose={() => setPendingReviewListing(null)}
            onApprove={() => approveListing(pendingReviewListing.id)}
            approving={approvingListingId === pendingReviewListing.id}
            language={language}
            listingCode={formatListingCode(pendingReviewListing.id, listingCodePrefix)}
          />
        )}
      </div>
      </Localized>
    );
  }

  if (listingMode && session) {
    const updateListingField = (event) => {
      const { name, value, checked, type } = event.target;
      setListingForm((form) => {
        if (type !== "checkbox") return { ...form, [name]: value };
        if (Array.isArray(form[name])) {
          const updated = checked
            ? [...form[name], value]
            : form[name].filter((item) => item !== value);
          return {
            ...form,
            [name]: updated,
            ...(name === "facilities" && value === "ใกล้ BTS/MRT" ? { transit: checked } : {}),
          };
        }
        return { ...form, [name]: checked };
      });
    };

    const validateCurrentStep = () => {
      const errors = [];
      if (listingStep === 0) {
        if (!listingForm.projectName.trim()) errors.push("กรุณากรอกชื่อโครงการหรือชื่อทรัพย์");
        if (listingForm.propertyType === "other" && !listingForm.otherPropertyType.trim()) errors.push("กรุณาระบุประเภททรัพย์");
        if (!listingForm.province.trim()) errors.push("กรุณากรอกจังหวัด");
        if (!listingForm.district.trim()) errors.push("กรุณากรอกเขต/อำเภอ");
        if (!listingForm.subdistrict.trim()) errors.push("กรุณากรอกแขวง/ตำบล");
      } else if (listingStep === 1) {
        if (!listingForm.price || Number(listingForm.price) <= 0) errors.push("กรุณากรอกราคาที่ถูกต้อง");
        if (!listingForm.areaSqm || Number(listingForm.areaSqm) <= 0) errors.push("กรุณากรอกพื้นที่ใช้สอย");
        if (listingRoomStatus === "occupied" && !listingForm.tenantContractEndDate) {
          errors.push("กรุณาระบุวันหมดสัญญาเช่าของผู้เช่า");
        }
        if (!listingForm.availableDate) errors.push("กรุณาระบุวันที่พร้อมเข้าอยู่หรือพร้อมขาย");
      } else if (listingStep === 2) {
        if (!listingForm.images.length) errors.push("กรุณาอัปโหลดรูปภาพจริงของทรัพย์อย่างน้อย 1 รูป");
        if (!listingForm.contactName.trim()) errors.push("กรุณากรอกชื่อผู้ติดต่อ");
        if (!listingForm.contactPhone.trim()) errors.push("กรุณากรอกเบอร์โทรศัพท์ผู้ติดต่อ");
        if (listingForm.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(listingForm.contactEmail)) {
          errors.push("กรุณากรอกอีเมลสำหรับติดต่อให้ถูกต้อง");
        }
      }
      setValidationErrors(errors);
      setListingError(errors.length ? "กรุณากรอกข้อมูลที่จำเป็นให้ครบก่อนดำเนินการต่อ" : "");
      return errors.length === 0;
    };

    const addListingImages = async (event) => {
      const files = Array.from(event.target.files || []);
      event.target.value = "";
      const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
      const currentImages = listingForm.images;
      if (currentImages.length + files.length > 5) {
        setListingError("อัปโหลดได้ไม่เกิน 5 รูป");
        return;
      }
      if (files.some((file) => !acceptedTypes.includes(file.type))) {
        setListingError("รองรับไฟล์รูปภาพ JPG, PNG หรือ WebP เท่านั้น");
        return;
      }
      if (files.some((file) => file.size > 2 * 1024 * 1024) ||
          files.reduce((total, file) => total + file.size, 0) +
            currentImages.reduce((total, image) => total + Math.floor(image.length * 0.75), 0) > 6 * 1024 * 1024) {
        setListingError("รูปภาพแต่ละไฟล์ต้องไม่เกิน 2 MB และรวมกันไม่เกิน 6 MB");
        return;
      }
      try {
        const images = await Promise.all(files.map((file) => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("อ่านไฟล์รูปภาพไม่สำเร็จ กรุณาลองใหม่"));
          reader.readAsDataURL(file);
        })));
        setListingForm((form) => ({ ...form, images: [...form.images, ...images] }));
        setListingError("");
      } catch (requestError) {
        setListingError(requestError.message);
      }
    };

    const option = (field, value, label) => (
      <label className="listing-check" key={`${field}-${value}`}>
        <input
          type="checkbox"
          name={field}
          value={value}
          checked={Array.isArray(listingForm[field]) ? listingForm[field].includes(value) : listingForm[field]}
          onChange={updateListingField}
        />
        {label}
      </label>
    );

    const field = (name, label, options = {}) => (
      <label key={name}>
        {label}
        <input
          name={name}
          value={listingForm[name]}
          onChange={updateListingField}
          maxLength={options.maxLength || 160}
          type={options.type || "text"}
          min={options.min}
          max={options.max}
          step={options.step}
          required={options.required}
        />
      </label>
    );

    const reviewValue = (value) => value || "ไม่ได้ระบุ";
    const fullLocation = [listingForm.subdistrict, listingForm.district, listingForm.province].filter(Boolean).join(" ");

    return (
      <Localized language={language}>
      <div className="ah">
        <div className="wrap">
          <header>
            <button className="logo logo-button" type="button" onClick={goDashboard} aria-label="Finzhome แดชบอร์ด">Finzhome</button>
            <nav>
              <ThemeToggle theme={theme} language={language} onToggle={toggleTheme} />
              <button className="nav-link" type="button" onClick={toggleLanguage}>{language === "th" ? "English" : "ไทย"}</button>
              <button className="nav-link" onClick={() => { setListingMode(false); setAdminDashboard(adminEditingListing); }}>กลับแดชบอร์ด</button>
            </nav>
          </header>
          <main className="auth-page listing-page">
            <section className="auth-card listing-card">
              <span className="eyebrow">ลงประกาศอสังหาริมทรัพย์</span>
              <h1>{listingId ? "แก้ไขประกาศของคุณ" : "สร้างประกาศใหม่"}</h1>
              <p>
                {listingEditStatus === "published" || listingEditStatus === "closed"
                  ? "เมื่อส่งข้อมูลแก้ไข ประกาศจะกลับไปรอตรวจสอบและจะเผยแพร่อีกครั้งหลังผู้ดูแลอนุมัติ"
                  : "กรอกข้อมูลทีละขั้นตอน บันทึกเป็นฉบับร่างไว้ทำต่อภายหลังได้"}
              </p>
              <ol className="listing-stepper" aria-label="ขั้นตอนการลงประกาศ">
                {LISTING_STEPS.map((step, index) => (
                  <li className={index === listingStep ? "current" : index < listingStep ? "complete" : ""} key={step}>
                    <span>{index + 1}</span>{step}
                  </li>
                ))}
              </ol>
              <form onSubmit={submitListing}>
                {listingStep === 0 && (
                  <div className="listing-fields">
                    <div className="listing-field">
                      <span className="field-title">ประเภทประกาศ</span>
                      <div className="listing-options">
                        <label className="listing-check"><input type="radio" name="listingType" value="rent" checked={listingForm.listingType === "rent"} onChange={updateListingField} /> ให้เช่า</label>
                        <label className="listing-check"><input type="radio" name="listingType" value="sale" checked={listingForm.listingType === "sale"} onChange={updateListingField} /> ขาย</label>
                      </div>
                    </div>
                    <label>
                      ประเภททรัพย์
                      <select name="propertyType" value={listingForm.propertyType} onChange={updateListingField}>
                        <option value="condo">คอนโด</option>
                        <option value="apartment">อพาร์ตเมนต์</option>
                        <option value="house">บ้าน</option>
                        <option value="townhome">ทาวน์โฮม</option>
                        <option value="land">ที่ดิน</option>
                        <option value="other">อื่น ๆ</option>
                      </select>
                    </label>
                    {listingForm.propertyType === "other" && field("otherPropertyType", "ระบุประเภททรัพย์")}
                    {field("projectName", "ชื่อโครงการหรือชื่อทรัพย์", { required: true, maxLength: 120 })}
                    <div className="listing-grid">
                      {field("province", "จังหวัด", { required: true })}
                      {field("district", "เขต/อำเภอ", { required: true })}
                      {field("subdistrict", "แขวง/ตำบล", { required: true })}
                      {field("road", "ถนน/ซอย")}
                    </div>
                    {field("nearby", "สถานที่ใกล้เคียง")}
                  </div>
                )}

                {listingStep === 1 && (
                  <div className="listing-fields">
                    <div className="listing-grid">
                      {listingForm.propertyType !== "land" && field("bedrooms", "ห้องนอน", { type: "number", min: 0, max: 100 })}
                      {listingForm.propertyType !== "land" && field("bathrooms", "ห้องน้ำ", { type: "number", min: 0, max: 100, step: 0.5 })}
                      {field("floor", "ชั้น", { maxLength: 30 })}
                      {field("areaSqm", "พื้นที่ใช้สอย (ตร.ม.)", { type: "number", min: 1, max: 100000, step: 0.1, required: true })}
                      {field("parking", "ที่จอดรถ (คัน)", { type: "number", min: 0, max: 100 })}
                    </div>
                    <div className="listing-grid">
                      {field("price", listingForm.listingType === "sale" ? "ราคาขาย (บาท)" : "ค่าเช่าต่อเดือน (บาท)", { type: "number", min: 1, max: 1000000000, required: true })}
                      {listingForm.listingType === "rent" && field("deposit", "เงินประกัน (บาท)", { type: "number", min: 0, max: 1000000000 })}
                      {listingForm.listingType === "rent" && field("advanceRent", "ค่าเช่าล่วงหน้า (เดือน)", { type: "number", min: 0, max: 36 })}
                      {listingForm.listingType === "rent" && field("minContract", "สัญญาขั้นต่ำ (เดือน)", { type: "number", min: 1, max: 120 })}
                      {field("availableDate", "วันที่พร้อมเข้าอยู่/พร้อมขาย", { type: "date", required: true })}
                    </div>
                    <div className="listing-grid">
                      <label>
                        มีผู้เช่าไหม
                        <select value={listingRoomStatus} onChange={(event) => {
                          const roomStatus = event.target.value;
                          setListingRoomStatus(roomStatus);
                          if (roomStatus === "vacant") {
                            setListingForm((form) => ({ ...form, tenantContractEndDate: "" }));
                          }
                        }}>
                          <option value="vacant">ไม่มีผู้เช่า</option>
                          <option value="occupied">มีผู้เช่า</option>
                        </select>
                      </label>
                      {listingRoomStatus === "occupied" && field("tenantContractEndDate", "วันหมดสัญญาเช่า (ผู้เช่า)", { type: "date", required: true })}
                    </div>
                  </div>
                )}

                {listingStep === 2 && (
                  <div className="listing-fields">
                    <div className="listing-field">
                      <span className="field-title">เฟอร์นิเจอร์</span>
                      <select name="furnished" value={listingForm.furnished} onChange={updateListingField}>
                        <option value="none">ไม่มีเฟอร์นิเจอร์</option>
                        <option value="partial">มีบางส่วน</option>
                        <option value="fully">ตกแต่งครบ</option>
                      </select>
                    </div>
                    <div className="listing-field">
                      <span className="field-title">เครื่องใช้ไฟฟ้า</span>
                      <div className="listing-options">
                        {["เครื่องปรับอากาศ", "ตู้เย็น", "เครื่องซักผ้า", "เครื่องทำน้ำอุ่น", "โทรทัศน์", "ไมโครเวฟ"].map((item) => option("appliances", item, item))}
                      </div>
                    </div>
                    <div className="listing-field">
                      <span className="field-title">สิ่งอำนวยความสะดวก</span>
                      <div className="listing-options">
                        {["ฟิตเนส", "สระว่ายน้ำ", "รปภ. 24 ชั่วโมง", "ที่จอดรถ", "ใกล้ BTS/MRT"].map((item) => option("facilities", item, item))}
                      </div>
                    </div>
                    <div className="listing-options">
                      {option("pets", "allowed", "อนุญาตให้เลี้ยงสัตว์")}
                    </div>
                    <label>
                      รายละเอียดเพิ่มเติม
                      <textarea name="description" value={listingForm.description} onChange={updateListingField} maxLength={3000} rows={4} />
                    </label>
                    <label>
                      จุดเด่นของทรัพย์ (คั่นแต่ละข้อด้วยเครื่องหมายจุลภาค)
                      <input
                        name="highlights"
                        value={listingForm.highlights.join(", ")}
                        maxLength={500}
                        onChange={(event) => setListingForm((form) => ({
                          ...form,
                          highlights: event.target.value.split(",").map((item) => item.trim()).filter(Boolean),
                        }))}
                      />
                    </label>
                    <label>
                      รูปภาพจริง (JPG, PNG หรือ WebP ไม่เกิน 5 รูป, รูปละ 2 MB)
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={addListingImages} />
                    </label>
                    {listingForm.images.length > 0 && (
                      <div className="listing-photos">
                        {listingForm.images.map((image, index) => (
                          <div className="listing-photo" key={`${index}-${image.slice(0, 30)}`}>
                            <img src={image} alt={`รูปทรัพย์ ${index + 1}`} />
                            <button type="button" className="text-button" onClick={() => setListingForm((form) => ({
                              ...form,
                              images: form.images.filter((_, imageIndex) => imageIndex !== index),
                            }))}>ลบรูป</button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="listing-grid">
                      {field("contactName", "ชื่อผู้ติดต่อ", { required: true })}
                      {field("contactPhone", "เบอร์โทรศัพท์", { type: "tel", required: true })}
                      {field("contactEmail", "อีเมลสำหรับติดต่อ", { type: "email" })}
                      {field("lineId", "LINE ID")}
                    </div>
                  </div>
                )}

                {listingStep === 3 && (
                  <section className="listing-review" aria-label="ตรวจทานประกาศ">
                    <h2>ตรวจทานรายละเอียดก่อนส่ง</h2>
                    <p className="review-price">{listingForm.listingType === "sale" ? "ขาย" : "ให้เช่า"} · {formatNumber(listingForm.price || 0, language)} บาท{listingForm.listingType === "rent" ? "/เดือน" : ""}</p>
                    <dl>
                      <dt>ชื่อโครงการ</dt><dd>{reviewValue(listingForm.projectName)}</dd>
                      <dt>ประเภททรัพย์</dt><dd>{reviewValue(listingForm.propertyType === "other" ? listingForm.otherPropertyType : ({
                        condo: "คอนโด",
                        apartment: "อพาร์ตเมนต์",
                        house: "บ้าน",
                        townhome: "ทาวน์โฮม",
                        land: "ที่ดิน",
                      }[listingForm.propertyType] || "อื่น ๆ"))}</dd>
                      <dt>ทำเล</dt><dd>{reviewValue([fullLocation, listingForm.road, listingForm.nearby].filter(Boolean).join(" · "))}</dd>
                      <dt>รายละเอียดทรัพย์</dt><dd>{reviewValue(`${listingForm.bedrooms || "-"} ห้องนอน · ${listingForm.bathrooms || "-"} ห้องน้ำ · ${listingForm.areaSqm || "-"} ตร.ม. · ${listingForm.parking || 0} ที่จอดรถ`)}</dd>
                      <dt>เงื่อนไข</dt><dd>{listingForm.listingType === "rent" ? `ประกัน ${listingForm.deposit || 0} บาท · ล่วงหน้า ${listingForm.advanceRent || 0} เดือน · สัญญาขั้นต่ำ ${listingForm.minContract || "-"} เดือน` : "ประกาศขาย"}</dd>
                      <dt>สถานะผู้เช่า</dt><dd>{ROOM_STATUS_LABELS[listingRoomStatus]}</dd>
                      {listingRoomStatus === "occupied" && <><dt>วันหมดสัญญาเช่า</dt><dd>{reviewValue(listingForm.tenantContractEndDate)}</dd></>}
                      <dt>พร้อมเข้าอยู่/ขาย</dt><dd>{reviewValue(listingForm.availableDate)}</dd>
                      <dt>เฟอร์นิเจอร์และอุปกรณ์</dt><dd>{[({ none: "ไม่มีเฟอร์นิเจอร์", partial: "มีเฟอร์นิเจอร์บางส่วน", fully: "ตกแต่งครบ" })[listingForm.furnished], ...listingForm.appliances.map((item) => translateText(language, item))].join(", ")}</dd>
                      <dt>สิ่งอำนวยความสะดวก</dt><dd>{reviewValue(listingForm.facilities.map((item) => translateText(language, item)).join(", "))}</dd>
                      <dt>เลี้ยงสัตว์</dt><dd>{listingForm.pets ? "อนุญาต" : "ไม่อนุญาต"}</dd>
                      <dt>รายละเอียดเพิ่มเติม</dt><dd>{reviewValue(listingForm.description)}</dd>
                      <dt>จุดเด่น</dt><dd>{reviewValue(listingForm.highlights.join(", "))}</dd>
                      <dt>ผู้ติดต่อ</dt><dd>{reviewValue(`${listingForm.contactName} · ${listingForm.contactPhone} · ${listingForm.contactEmail} · ${listingForm.lineId}`)}</dd>
                    </dl>
                    <div className="listing-photos">
                      {listingForm.images.map((image, index) => <img src={image} alt={`รูปทรัพย์ ${index + 1}`} key={`${index}-${image.slice(0, 30)}`} />)}
                    </div>
                    <p className="review-note">เมื่อยืนยัน ประกาศจะมีสถานะ “รอตรวจสอบ” และจะแสดงต่อสาธารณะหลังได้รับการอนุมัติ</p>
                  </section>
                )}

                {validationErrors.length > 0 && (
                  <ul className="form-error listing-errors" role="alert">
                    {validationErrors.map((message) => <li key={message}>{message}</li>)}
                  </ul>
                )}
                {listingError && validationErrors.length === 0 && <p className="form-error" role="alert">{listingError}</p>}
                <div className="listing-actions">
                  {listingStep > 0 && <button className="secondary-button" type="button" onClick={() => { setListingStep((step) => step - 1); setListingError(""); setValidationErrors([]); }}>ย้อนกลับ</button>}
                  {listingStep < LISTING_STEPS.length - 1 ? (
                    <button className="btn" type="button" onClick={() => {
                      if (validateCurrentStep()) setListingStep((step) => step + 1);
                    }}>ถัดไป</button>
                  ) : (
                    <button className="btn" type="submit" disabled={listingLoading}>
                      {listingLoading ? "กำลังส่ง..." : listingEditStatus === "published" || listingEditStatus === "closed" ? "ยืนยันส่งแก้ไขตรวจสอบ" : "ยืนยันส่งตรวจสอบ"}
                    </button>
                  )}
                  {listingEditStatus !== "published" && listingEditStatus !== "closed" && (
                    <button className="secondary-button save-draft" type="button" disabled={listingLoading} onClick={() => saveListing("draft")}>
                      {listingLoading ? "กำลังบันทึก..." : "บันทึกฉบับร่าง"}
                    </button>
                  )}
                </div>
              </form>
            </section>
          </main>
        </div>
      </div>
      </Localized>
    );
  }

  if (session && session.role !== "admin") {
    return (
      <Localized language={language}>
      <div className="ah">
        <div className="wrap">
          <header>
            <button className="logo logo-button" type="button" onClick={goDashboard}>Finzhome</button>
            <nav>
              <span className="user-email">{session.email}</span>
              <ThemeToggle theme={theme} language={language} onToggle={toggleTheme} />
              <button className="nav-link" type="button" onClick={toggleLanguage}>{language === "th" ? "English" : "ไทย"}</button>
              <button className="nav-link" onClick={logout}>ออกจากระบบ</button>
            </nav>
          </header>
          <main className="auth-page">
            <section className="auth-card">
              <h1>ไม่มีสิทธิ์เข้าใช้งาน</h1>
              <p>ระบบนี้สำหรับผู้ดูแลเท่านั้น กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแล</p>
            </section>
          </main>
        </div>
      </div>
      </Localized>
    );
  }

  return (
    <AuthScreen
      authForm={authForm}
      setAuthForm={setAuthForm}
      authError={authError}
      authLoading={authLoading}
      submitAuth={submitAuth}
      goDashboard={goDashboard}
      language={language}
      onToggleLanguage={toggleLanguage}
      theme={theme}
      onToggleTheme={toggleTheme}
    />
  );
}
