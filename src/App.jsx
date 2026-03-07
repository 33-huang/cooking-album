import { useState, useRef, useEffect } from "react";
import { supabase } from "./supabase.js";

const ADMIN_PASSWORD = "5233";
const COVER_TAG = "封面";

// === i18n translations ===
const T = {
  dishes: { zh:"{f} / {t} 道料理", ja:"{f} / {t} 品の料理", en:"{f} / {t} dishes" },
  cover: { zh:"⭐ 封面", ja:"⭐ カバー", en:"⭐ Cover" },
  all: { zh:"全部", ja:"すべて", en:"All" },
  filter: { zh:"筛选：", ja:"絞込：", en:"Filter:" },
  clearFilter: { zh:"清除", ja:"クリア", en:"Clear" },
  add: { zh:"+ 追加", ja:"+ 追加", en:"+ Add" },
  admin: { zh:"🔒 管理", ja:"🔒 管理", en:"🔒 Admin" },
  cancel: { zh:"取消", ja:"キャンセル", en:"Cancel" },
  tags: { zh:"标签", ja:"タグ", en:"Tags" },
  noCover: { zh:"还没有标记封面的料理", ja:"カバーに設定された料理はまだありません", en:"No cover dishes yet" },
  noCoverHint: { zh:"编辑料理时可以添加「⭐ 封面」标签", ja:"料理を編集して「⭐ カバー」タグを追加できます", en:"Add the \"⭐ Cover\" tag when editing a dish" },
  noPhotos: { zh:"还没有料理照片", ja:"料理の写真はまだありません", en:"No dishes yet" },
  noMatch: { zh:"没有找到匹配的料理", ja:"条件に一致する料理が見つかりません", en:"No matching dishes" },
  loading: { zh:"加载中...", ja:"読み込み中...", en:"Loading..." },
  pwTitle: { zh:"🔒 需要管理员密码", ja:"🔒 管理者パスワードが必要です", en:"🔒 Admin password required" },
  pwDesc: { zh:"请输入密码以继续操作", ja:"続行するにはパスワードを入力してください", en:"Enter password to continue" },
  pwPlaceholder: { zh:"输入密码", ja:"パスワードを入力", en:"Enter password" },
  pwError: { zh:"密码不正确，请重试", ja:"パスワードが正しくありません", en:"Incorrect password, try again" },
  confirm: { zh:"确认", ja:"確認", en:"Confirm" },
  addDish: { zh:"添加料理", ja:"料理を追加", en:"Add Dish" },
  editDish: { zh:"编辑料理", ja:"料理を編集", en:"Edit Dish" },
  back: { zh:"← 返回", ja:"← 戻る", en:"← Back" },
  save: { zh:"保存", ja:"保存", en:"Save" },
  saving: { zh:"保存中...", ja:"保存中...", en:"Saving..." },
  saveFail: { zh:"保存失败，请重试", ja:"保存に失敗しました。再試行してください", en:"Save failed, please retry" },
  changePhoto: { zh:"📷 更换", ja:"📷 変更", en:"📷 Change" },
  tapPhoto: { zh:"点击选择照片", ja:"タップして写真を選択", en:"Tap to select photo" },
  dishName: { zh:"菜名", ja:"料理名", en:"Dish Name" },
  zhLabel: { zh:"🇨🇳 中文", ja:"🇨🇳 中国語", en:"🇨🇳 Chinese" },
  jaLabel: { zh:"🇯🇵 日本語", ja:"🇯🇵 日本語", en:"🇯🇵 Japanese" },
  enLabel: { zh:"🇬🇧 English", ja:"🇬🇧 英語", en:"🇬🇧 English" },
  zhPlaceholder: { zh:"输入菜名，或用 / 分隔三语", ja:"料理名を入力、または / で3言語を区切る", en:"Enter name, or use / to split 3 languages" },
  jaPlaceholder: { zh:"日文菜名", ja:"日本語の料理名", en:"Japanese name" },
  enPlaceholder: { zh:"English name", ja:"英語の料理名", en:"English name" },
  splitDetected: { zh:"✨ 检测到 /，点击自动拆分到三语", ja:"✨ / を検出。タップで3言語に自動分割", en:"✨ Detected /, tap to auto-split into 3 languages" },
  splitHint: { zh:"💡 支持格式：中文名/日文名/英文名", ja:"💡 対応形式：中国語名/日本語名/英語名", en:"💡 Format: Chinese/Japanese/English" },
  tagsLabel: { zh:"标签", ja:"タグ", en:"Tags" },
  special: { zh:"⭐ 特殊", ja:"⭐ 特別", en:"⭐ Special" },
  coverTag: { zh:"⭐ 封面", ja:"⭐ カバー", en:"⭐ Cover" },
  edit: { zh:"编辑", ja:"編集", en:"Edit" },
  delete: { zh:"删除", ja:"削除", en:"Delete" },
  batchTitle: { zh:"批量标签 · 已选 {n} 张", ja:"一括タグ · {n}枚選択中", en:"Batch Tags · {n} selected" },
  batchApply: { zh:"应用", ja:"適用", en:"Apply" },
  batchProcessing: { zh:"处理中...", ja:"処理中...", en:"Processing..." },
  batchHint: { zh:"点击标签添加（绿色）或移除（红色），再点取消选择", ja:"タグをタップで追加（緑）または削除（赤）、もう一度タップで解除", en:"Tap to add (green) or remove (red), tap again to deselect" },
  batchTip: { zh:"💡 点一次 = 添加（绿），点两次 = 取消，长按/右键 = 移除（红）", ja:"💡 1回タップ = 追加（緑）、2回 = 解除、長押し/右クリック = 削除（赤）", en:"💡 Tap = add (green), twice = deselect, long press = remove (red)" },
  tagMgmt: { zh:"⚙️ 标签管理", ja:"⚙️ タグ管理", en:"⚙️ Tag Management" },
  coverTagTitle: { zh:"⭐ 封面标签", ja:"⭐ カバータグ", en:"⭐ Cover Tag" },
  coverTagDesc: { zh:"打开 App 默认展示标记了「封面」的料理。此标签不可删除或修改。", ja:"アプリを開くと「カバー」タグ付きの料理がデフォルトで表示されます。このタグは削除・変更できません。", en:"Dishes tagged \"Cover\" show by default. This tag cannot be deleted or modified." },
  rename: { zh:"改名", ja:"名前変更", en:"Rename" },
  editBtn: { zh:"编辑", ja:"編集", en:"Edit" },
  collapse: { zh:"收起", ja:"閉じる", en:"Collapse" },
  deleteBtn: { zh:"删除", ja:"削除", en:"Delete" },
  confirmQ: { zh:"确定？", ja:"本当に？", en:"Sure?" },
  yes: { zh:"是", ja:"はい", en:"Yes" },
  no: { zh:"否", ja:"いいえ", en:"No" },
  ok: { zh:"确定", ja:"確定", en:"OK" },
  newTagPlaceholder: { zh:"输入新标签", ja:"新しいタグを入力", en:"Enter new tag" },
  addBtn: { zh:"添加", ja:"追加", en:"Add" },
  addCategory: { zh:"➕ 添加新分类", ja:"➕ 新しいカテゴリーを追加", en:"➕ Add New Category" },
  catNamePlaceholder: { zh:"分类名称", ja:"カテゴリー名", en:"Category name" },
  createBtn: { zh:"创建", ja:"作成", en:"Create" },
  unnamed: { zh:"未命名", ja:"名前なし", en:"Unnamed" },
};

// App title translations
const TITLE_I18N = {
  zh: "🍳 三三食堂",
  ja: "🍳 三ちゃん食堂",
  en: "🍳 Sunny's Kitchen",
};

// Tag & category name translations (key = Chinese name stored in DB)
const TAG_I18N = {
  // Category names
  "场合": { ja:"シーン", en:"Occasion" },
  "做菜人": { ja:"作った人", en:"Chef" },
  "料理类型": { ja:"料理タイプ", en:"Dish Type" },
  "肉类": { ja:"お肉", en:"Meat" },
  "辣度": { ja:"辛さ", en:"Spiciness" },
  "用具": { ja:"道具", en:"Utensil" },
  // 场合 tags
  "家常菜": { ja:"家庭料理", en:"Home cooking" },
  "特制": { ja:"スペシャル", en:"Special" },
  "brunch": { ja:"ブランチ", en:"Brunch" },
  "招待": { ja:"おもてなし", en:"For guests" },
  "年夜饭": { ja:"年越し料理", en:"New Year dinner" },
  // 做菜人 tags
  "33": { ja:"33", en:"33" },
  "xw": { ja:"xw", en:"xw" },
  // 料理类型 tags
  "汤": { ja:"スープ", en:"Soup" },
  "荤菜": { ja:"肉料理", en:"Meat dish" },
  "素菜": { ja:"野菜料理", en:"Veggie" },
  "荤+素": { ja:"肉+野菜", en:"Meat & Veggie" },
  "面": { ja:"麺", en:"Noodles" },
  // 肉类 tags
  "鸡肉": { ja:"鶏肉", en:"Chicken" },
  "牛肉": { ja:"牛肉", en:"Beef" },
  "排骨": { ja:"スペアリブ", en:"Ribs" },
  "香肠": { ja:"ソーセージ", en:"Sausage" },
  "猪肉": { ja:"豚肉", en:"Pork" },
  "鸡翅": { ja:"手羽先", en:"Wings" },
  "鱼": { ja:"魚", en:"Fish" },
  // 辣度 tags
  "微辣": { ja:"ピリ辛", en:"Mild spicy" },
  // 用具 tags
  "烤箱": { ja:"オーブン", en:"Oven" },
};
// Translate a tag or category name based on current language
const tTag = (name, lang) => {
  if (lang === "zh" || !TAG_I18N[name]) return name;
  return TAG_I18N[name][lang] || name;
};

const CAT_COLORS_LIST = [
  { bg:"#fef3e2",active:"#f59e0b",text:"#92400e",border:"#fcd34d" },
  { bg:"#ede9fe",active:"#8b5cf6",text:"#5b21b6",border:"#c4b5fd" },
  { bg:"#e0f2fe",active:"#0ea5e9",text:"#075985",border:"#7dd3fc" },
  { bg:"#fce7f3",active:"#ec4899",text:"#9d174d",border:"#f9a8d4" },
  { bg:"#fef2f2",active:"#ef4444",text:"#991b1b",border:"#fca5a5" },
  { bg:"#ecfdf5",active:"#10b981",text:"#065f46",border:"#6ee7b7" },
  { bg:"#fff7ed",active:"#f97316",text:"#9a3412",border:"#fdba74" },
  { bg:"#f0f9ff",active:"#3b82f6",text:"#1e40af",border:"#93c5fd" },
];
const EMOJIS = ["🎯","👨‍🍳","🍽️","🥩","🌶️","🥬","🍰","🐟","🍳","⭐","🏷️","🎉","🥗","🍜","🥘"];
const LANGS = ["zh","ja","en"];
const LANG_LABELS = { zh:"中", ja:"日", en:"EN" };
const getCatColor = i => CAT_COLORS_LIST[i % CAT_COLORS_LIST.length];

function TagPill({ tag, small, tagSystem, lang }) {
  const coverLabel = lang ? T.coverTag[lang] : "⭐ " + tag;
  if (tag === COVER_TAG) {
    return <span style={{ background:"#fffbeb", color:"#b45309", border:"1px solid #fcd34d", borderRadius:12, padding:small?"1px 7px":"3px 10px", fontSize:small?10:12, fontWeight:500, whiteSpace:"nowrap", display:"inline-block" }}>{coverLabel}</span>;
  }
  let ci = 0, found = false;
  const cats = Object.keys(tagSystem);
  for (let i = 0; i < cats.length; i++) {
    if (tagSystem[cats[i]].tags.includes(tag)) { ci = i; found = true; break; }
  }
  const c = found ? getCatColor(ci) : { bg:"#f3f4f6",text:"#6b7280",border:"#d1d5db" };
  return <span style={{ background:c.bg, color:c.text, border:"1px solid " + c.border, borderRadius:12, padding:small?"1px 7px":"3px 10px", fontSize:small?10:12, fontWeight:500, whiteSpace:"nowrap", display:"inline-block" }}>{tTag(tag, lang)}</span>;
}

function smartSplit(input) {
  const parts = input.split("/").map(s => s.trim()).filter(Boolean);
  if (parts.length >= 3) return { zh: parts[0], ja: parts[1], en: parts[2] };
  if (parts.length === 2) return { zh: parts[0], ja: parts[1], en: "" };
  return null;
}

function PasswordModal({ onSuccess, onCancel, lang }) {
  const t = key => T[key][lang];
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const check = () => { if (pw === ADMIN_PASSWORD) onSuccess(); else { setError(true); setPw(""); } };
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,0.4)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:16, padding:24, width:"100%", maxWidth:320 }}>
        <h3 style={{ fontSize:17, fontWeight:600, color:"#2d2a26", margin:"0 0 4px", textAlign:"center" }}>{t("pwTitle")}</h3>
        <p style={{ fontSize:13, color:"#9a9590", margin:"0 0 16px", textAlign:"center" }}>{t("pwDesc")}</p>
        <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setError(false);}} onKeyDown={e=>e.key==="Enter"&&check()} placeholder={t("pwPlaceholder")} autoFocus
          style={{ width:"100%", padding:"10px 12px", border:"1px solid " + (error?"#ef4444":"#d5d0cb"), borderRadius:8, fontSize:15, outline:"none", boxSizing:"border-box", marginBottom:8 }} />
        {error && <p style={{ fontSize:12, color:"#ef4444", margin:"0 0 8px" }}>{t("pwError")}</p>}
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={onCancel} style={{ flex:1, padding:"10px 0", border:"1px solid #d5d0cb", borderRadius:8, fontSize:14, cursor:"pointer", background:"#fff", color:"#6b6560" }}>{t("cancel")}</button>
          <button onClick={check} style={{ flex:1, padding:"10px 0", border:"none", borderRadius:8, fontSize:14, fontWeight:600, cursor:"pointer", background:"#e67e22", color:"#fff" }}>{t("confirm")}</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [appTitle, setAppTitle] = useState("🍳 我们的料理帖");
  const [tagSystem, setTagSystem] = useState({});
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("gallery");
  const [lang, setLang] = useState("zh");
  const [filterCat, setFilterCat] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [specialFilter, setSpecialFilter] = useState("cover");
  const [upload, setUpload] = useState({ image:null, file:null, names:{zh:"",ja:"",en:""}, tags:[] });
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [init, setInit] = useState(false);
  const [batchMode, setBatchMode] = useState(false);
  const [batchSelected, setBatchSelected] = useState([]);
  const [batchTagging, setBatchTagging] = useState(false);
  const [tagMgr, setTagMgr] = useState({ editingCat:null, newCatName:"", newCatEmoji:"🏷️", newTagText:{}, renamingCat:null, renameCatName:"", renamingTag:null, renameTagVal:"", confirmDeleteCat:null, editTitle:false, editTitleVal:"" });
  const fileRef = useRef();
  const editFileRef = useRef();

  const t = key => T[key]?.[lang] || T[key]?.zh || key;

  const getValidTags = () => {
    const valid = new Set([COVER_TAG]);
    Object.values(tagSystem).forEach(v => v.tags.forEach(tg => valid.add(tg)));
    return valid;
  };
  const getDisplayTags = (tags) => {
    const valid = getValidTags();
    return tags.filter(tg => tg !== COVER_TAG && valid.has(tg));
  };

  const requireAdmin = (action) => {
    if (isAdmin) { action(); return; }
    setPendingAction(() => action);
    setShowPwModal(true);
  };
  const onPwSuccess = () => { setIsAdmin(true); setShowPwModal(false); if (pendingAction) { pendingAction(); setPendingAction(null); } };

  useEffect(() => { if (!init) { loadAll(); setInit(true); } }, [init]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [photosRes, tagsRes, settingsRes] = await Promise.all([
        supabase.from("photos").select("*").order("created_at", { ascending: false }),
        supabase.from("tag_system").select("*").order("sort_order"),
        supabase.from("app_settings").select("*"),
      ]);
      if (photosRes.data) {
        setPhotos(photosRes.data.map(p => ({
          id: p.id, image: p.image_url,
          names: { zh: p.name_zh, ja: p.name_ja || "", en: p.name_en || "" },
          tags: p.tags || [], date: new Date(p.created_at).toLocaleDateString("zh-CN"),
        })));
      }
      if (tagsRes.data) {
        const sys = {};
        tagsRes.data.forEach(tg => { sys[tg.category] = { emoji: tg.emoji, tags: tg.tags || [], id: tg.id }; });
        setTagSystem(sys);
      }
      if (settingsRes.data) {
        const titleRow = settingsRes.data.find(s => s.key === "app_title");
        if (titleRow) setAppTitle(titleRow.value);
      }
    } catch (err) { console.error("Load error:", err); }
    setLoading(false);
  };

  const uploadImage = async (file) => {
    const ext = file.name.split(".").pop();
    const fileName = Date.now() + "_" + Math.random().toString(36).slice(2) + "." + ext;
    const { error } = await supabase.storage.from("photos").upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from("photos").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const saveNew = async () => {
    if (!upload.file) return;
    setSaving(true);
    try {
      const imageUrl = await uploadImage(upload.file);
      const { data, error } = await supabase.from("photos").insert({
        image_url: imageUrl, name_zh: upload.names.zh || t("unnamed"),
        name_ja: upload.names.ja || "", name_en: upload.names.en || "", tags: upload.tags,
      }).select().single();
      if (error) throw error;
      setPhotos(p => [{ id: data.id, image: data.image_url, names: { zh: data.name_zh, ja: data.name_ja, en: data.name_en }, tags: data.tags, date: new Date(data.created_at).toLocaleDateString("zh-CN") }, ...p]);
      setUpload({ image:null, file:null, names:{zh:"",ja:"",en:""}, tags:[] });
      setView("gallery");
    } catch (err) { console.error("Save error:", err); alert(t("saveFail")); }
    setSaving(false);
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      let imageUrl = editing.image;
      if (editing.newFile) imageUrl = await uploadImage(editing.newFile);
      const { error } = await supabase.from("photos").update({
        image_url: imageUrl, name_zh: editing.names.zh || t("unnamed"),
        name_ja: editing.names.ja || "", name_en: editing.names.en || "", tags: editing.tags,
      }).eq("id", editing.id);
      if (error) throw error;
      const updated = { ...editing, image: imageUrl }; delete updated.newFile;
      setPhotos(p => p.map(ph => ph.id === updated.id ? updated : ph));
      setDetail(updated); setEditing(null); setView("detail");
    } catch (err) { console.error("Edit error:", err); alert(t("saveFail")); }
    setSaving(false);
  };

  const del = async (id) => {
    try {
      await supabase.from("photos").delete().eq("id", id);
      setPhotos(p => p.filter(x => x.id !== id));
      setView("gallery"); setDetail(null); setEditing(null);
    } catch (err) { console.error("Delete error:", err); }
  };

  const saveTitle = async (title) => {
    setAppTitle(title);
    await supabase.from("app_settings").upsert({ key: "app_title", value: title });
  };

  const syncTagSystem = async (newSys) => {
    setTagSystem(newSys);
    await supabase.from("tag_system").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const rows = Object.entries(newSys).map(([cat, v], i) => ({ category: cat, emoji: v.emoji, tags: v.tags, sort_order: i }));
    if (rows.length > 0) await supabase.from("tag_system").insert(rows);
  };

  const toggleBatchSelect = (id) => { setBatchSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]); };

  const applyBatchTags = async (tagsToAdd, tagsToRemove) => {
    setSaving(true);
    const updates = photos.filter(p => batchSelected.includes(p.id)).map(p => {
      let newTags = [...p.tags];
      tagsToAdd.forEach(tg => { if (!newTags.includes(tg)) newTags.push(tg); });
      tagsToRemove.forEach(tg => { newTags = newTags.filter(x => x !== tg); });
      return { ...p, tags: newTags };
    });
    for (const u of updates) { await supabase.from("photos").update({ tags: u.tags }).eq("id", u.id); }
    setPhotos(p => p.map(ph => { const upd = updates.find(u => u.id === ph.id); return upd || ph; }));
    setBatchMode(false); setBatchSelected([]); setBatchTagging(false); setSaving(false);
  };

  const getFiltered = () => {
    let base = photos;
    if (specialFilter === "cover") base = base.filter(p => p.tags.includes(COVER_TAG));
    if (selectedTags.length > 0) base = base.filter(p => selectedTags.every(tg => p.tags.includes(tg)));
    return base;
  };
  const filtered = getFiltered();

  const toggleFilter = tag => setSelectedTags(p => p.includes(tag) ? p.filter(tg=>tg!==tag) : [...p,tag]);
  const getName = photo => photo.names[lang] || photo.names.zh || t("unnamed");

  const handleFile = (e, cb, fileCb) => {
    const f = e.target.files?.[0]; if(!f) return;
    if (fileCb) fileCb(f);
    const r = new FileReader();
    r.onload = ev => cb(ev.target.result);
    r.readAsDataURL(f);
  };

  const LangSwitch = ({ size }) => (
    <div style={{ display:"flex", background:"#f0eeea", borderRadius:8, padding:2 }}>
      {LANGS.map(l => (
        <button key={l} onClick={()=>setLang(l)} style={{ border:"none", borderRadius:6, padding:size==="sm"?"3px 8px":"4px 10px", fontSize:size==="sm"?11:12, fontWeight:600, cursor:"pointer", background:lang===l?"#fff":"transparent", color:lang===l?"#2d2a26":"#9a9590", boxShadow:lang===l?"0 1px 2px rgba(0,0,0,0.1)":"none" }}>{LANG_LABELS[l]}</button>
      ))}
    </div>
  );

  const addCategory = () => { const name = tagMgr.newCatName.trim(); if (!name || tagSystem[name]) return; syncTagSystem({ ...tagSystem, [name]: { emoji:tagMgr.newCatEmoji, tags:[] } }); setTagMgr(p => ({ ...p, newCatName:"", newCatEmoji:"🏷️" })); };
  const deleteCategory = cat => {
    const removed = tagSystem[cat].tags; const ns = { ...tagSystem }; delete ns[cat]; syncTagSystem(ns);
    setPhotos(p => p.map(ph => ({ ...ph, tags:ph.tags.filter(tg=>!removed.includes(tg)) })));
    setSelectedTags(p => p.filter(tg=>!removed.includes(tg)));
    if (filterCat===cat) setFilterCat(null);
    setTagMgr(p => ({ ...p, editingCat:null, confirmDeleteCat:null }));
    removed.forEach(async tag => { const { data } = await supabase.from("photos").select("id, tags").contains("tags", [tag]); if (data) data.forEach(async ph => { await supabase.from("photos").update({ tags: ph.tags.filter(tg=>tg!==tag) }).eq("id", ph.id); }); });
  };
  const renameCategory = oldName => { const newName = tagMgr.renameCatName.trim(); if (!newName || newName===oldName || tagSystem[newName]) { setTagMgr(p=>({...p,renamingCat:null})); return; } syncTagSystem(Object.fromEntries(Object.entries(tagSystem).map(([k,v])=>k===oldName?[newName,v]:[k,v]))); setTagMgr(p => ({ ...p, renamingCat:null })); };
  const setCatEmoji = (cat, emoji) => syncTagSystem({ ...tagSystem, [cat]:{ ...tagSystem[cat], emoji } });
  const addTag = cat => { const tv = (tagMgr.newTagText[cat]||"").trim(); if (!tv || tagSystem[cat].tags.includes(tv)) return; syncTagSystem({ ...tagSystem, [cat]:{ ...tagSystem[cat], tags:[...tagSystem[cat].tags, tv] } }); setTagMgr(p => ({ ...p, newTagText:{...p.newTagText,[cat]:""} })); };
  const deleteTag = (cat, tag) => { syncTagSystem({ ...tagSystem, [cat]:{ ...tagSystem[cat], tags:tagSystem[cat].tags.filter(tg=>tg!==tag) } }); setPhotos(p => p.map(ph => ({ ...ph, tags:ph.tags.filter(tg=>tg!==tag) }))); setSelectedTags(p => p.filter(tg=>tg!==tag)); };
  const renameTag = (cat, oldTag) => { const newTag = tagMgr.renameTagVal.trim(); if (!newTag || newTag===oldTag) { setTagMgr(p=>({...p,renamingTag:null})); return; } syncTagSystem({ ...tagSystem, [cat]:{ ...tagSystem[cat], tags:tagSystem[cat].tags.map(tg=>tg===oldTag?newTag:tg) } }); setPhotos(p => p.map(ph => ({ ...ph, tags:ph.tags.map(tg=>tg===oldTag?newTag:tg) }))); setSelectedTags(p => p.map(tg=>tg===oldTag?newTag:tg)); setTagMgr(p => ({ ...p, renamingTag:null })); };

  const allTags = [COVER_TAG, ...Object.values(tagSystem).flatMap(v => v.tags)];

  const PhotoForm = ({ data, setData, onSave, title, onBack, fRef, isSaving }) => {
    const canSplit = data.names.zh.includes("/");
    const doSplit = () => { const result = smartSplit(data.names.zh); if (result) setData(p => ({ ...p, names: { zh: result.zh, ja: result.ja, en: result.en } })); };
    return (
      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:"#fafaf8" }}>
        <div style={{ position:"sticky", top:0, zIndex:10, background:"#fafaf8", borderBottom:"1px solid #e8e5e0", padding:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={onBack} style={{ background:"none", border:"none", fontSize:15, color:"#6b6560", cursor:"pointer" }}>{t("back")}</button>
          <h2 style={{ fontSize:17, fontWeight:600, color:"#2d2a26", margin:0 }}>{title}</h2>
          <button onClick={onSave} disabled={!data.image || isSaving} style={{ background:data.image&&!isSaving?"#e67e22":"#d5d0cb", color:"#fff", border:"none", borderRadius:16, padding:"6px 16px", fontSize:14, fontWeight:600, cursor:data.image&&!isSaving?"pointer":"default" }}>{isSaving ? t("saving") : t("save")}</button>
        </div>
        <div style={{ padding:16 }}>
          <input type="file" accept="image/*" ref={fRef} onChange={e => handleFile(e, img => setData(p=>({...p,image:img})), f => setData(p=>({...p,newFile:f,file:f})))} style={{ display:"none" }} />
          {data.image ? (
            <div style={{ position:"relative", marginBottom:20 }}>
              <img src={data.image} style={{ width:"100%", borderRadius:12, display:"block" }} alt="" />
              <div style={{ position:"absolute", top:8, right:8, display:"flex", gap:6 }}>
                <button onClick={()=>fRef.current?.click()} style={{ background:"rgba(0,0,0,0.5)", color:"#fff", border:"none", borderRadius:16, padding:"6px 12px", fontSize:12, cursor:"pointer" }}>{t("changePhoto")}</button>
                <button onClick={()=>setData(p=>({...p,image:null,file:null,newFile:null}))} style={{ background:"rgba(0,0,0,0.5)", color:"#fff", border:"none", borderRadius:"50%", width:32, height:32, fontSize:16, cursor:"pointer" }}>✕</button>
              </div>
            </div>
          ) : (
            <div onClick={()=>fRef.current?.click()} style={{ border:"2px dashed #d5d0cb", borderRadius:12, padding:"44px 20px", textAlign:"center", cursor:"pointer", marginBottom:20, background:"#fff" }}>
              <div style={{ fontSize:40, marginBottom:8 }}>📸</div>
              <p style={{ color:"#9a9590", fontSize:14, margin:0 }}>{t("tapPhoto")}</p>
            </div>
          )}
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"#6b6560", display:"block", marginBottom:8 }}>{t("dishName")}</label>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ fontSize:12, color:"#9a9590", width:56, flexShrink:0 }}>{t("zhLabel")}</span>
              <input value={data.names.zh} onChange={e=>setData(p=>({...p,names:{...p.names,zh:e.target.value}}))} placeholder={t("zhPlaceholder")} style={{ flex:1, padding:"9px 12px", border:"1px solid #d5d0cb", borderRadius:8, fontSize:14, outline:"none", background:"#fff", boxSizing:"border-box" }} />
            </div>
            {canSplit && <button onClick={doSplit} style={{ width:"100%", padding:"9px 0", border:"1px solid #e67e22", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", marginBottom:10, background:"#fff8f0", color:"#e67e22" }}>{t("splitDetected")}</button>}
            <p style={{ fontSize:11, color:"#b0aaa5", margin:"0 0 10px", paddingLeft:64 }}>{t("splitHint")}</p>
            {[{key:"ja",label:t("jaLabel"),ph:t("jaPlaceholder")},{key:"en",label:t("enLabel"),ph:t("enPlaceholder")}].map(({key,label,ph})=>(
              <div key={key} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ fontSize:12, color:"#9a9590", width:56, flexShrink:0 }}>{label}</span>
                <input value={data.names[key]} onChange={e=>setData(p=>({...p,names:{...p.names,[key]:e.target.value}}))} placeholder={ph} style={{ flex:1, padding:"9px 12px", border:"1px solid #d5d0cb", borderRadius:8, fontSize:14, outline:"none", background:"#fff", boxSizing:"border-box" }} />
              </div>
            ))}
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:"#6b6560", display:"block", marginBottom:10 }}>{t("tagsLabel")}</label>
            <div style={{ marginBottom:14 }}>
              <p style={{ fontSize:12, fontWeight:600, color:"#b45309", margin:"0 0 6px" }}>{t("special")}</p>
              <button onClick={()=>setData(p=>({...p,tags:p.tags.includes(COVER_TAG)?p.tags.filter(tg=>tg!==COVER_TAG):[...p.tags,COVER_TAG]}))} style={{ border:"1px solid", borderRadius:14, padding:"5px 14px", fontSize:13, cursor:"pointer", background:data.tags.includes(COVER_TAG)?"#f59e0b":"#fffbeb", color:data.tags.includes(COVER_TAG)?"#fff":"#b45309", borderColor:data.tags.includes(COVER_TAG)?"#f59e0b":"#fcd34d" }}>{t("coverTag")}</button>
            </div>
            {Object.entries(tagSystem).map(([cat,v],ci) => { const col = getCatColor(ci); return (
              <div key={cat} style={{ marginBottom:14 }}>
                <p style={{ fontSize:12, fontWeight:600, color:col.text, margin:"0 0 6px" }}>{v.emoji} {tTag(cat,lang)}</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {v.tags.map(tag=>(<button key={tag} onClick={()=>setData(p=>({...p,tags:p.tags.includes(tag)?p.tags.filter(tg=>tg!==tag):[...p.tags,tag]}))} style={{ border:"1px solid", borderRadius:14, padding:"5px 14px", fontSize:13, cursor:"pointer", background:data.tags.includes(tag)?col.active:col.bg, color:data.tags.includes(tag)?"#fff":col.text, borderColor:data.tags.includes(tag)?col.active:col.border }}>{tTag(tag,lang)}</button>))}
                </div>
              </div>
            ); })}
          </div>
        </div>
      </div>
    );
  };

  const BatchTagPanel = () => {
    const [tagsToAdd, setTagsToAdd] = useState([]);
    const [tagsToRemove, setTagsToRemove] = useState([]);
    const toggleAdd = tg => { setTagsToRemove(p=>p.filter(x=>x!==tg)); setTagsToAdd(p=>p.includes(tg)?p.filter(x=>x!==tg):[...p,tg]); };
    const toggleRemove = tg => { setTagsToAdd(p=>p.filter(x=>x!==tg)); setTagsToRemove(p=>p.includes(tg)?p.filter(x=>x!==tg):[...p,tg]); };
    return (
      <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:"2px solid #e8e5e0", zIndex:50, maxHeight:"60vh", overflowY:"auto", padding:16 }}>
        <div style={{ maxWidth:480, margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
            <h3 style={{ fontSize:15, fontWeight:600, color:"#2d2a26", margin:0 }}>{t("batchTitle").replace("{n}", batchSelected.length)}</h3>
            <div style={{ display:"flex", gap:8 }}>
              <button onClick={()=>{setBatchTagging(false);}} style={{ background:"#f0eeea", border:"none", borderRadius:8, padding:"6px 12px", fontSize:13, cursor:"pointer", color:"#6b6560" }}>{t("cancel")}</button>
              <button onClick={()=>applyBatchTags(tagsToAdd, tagsToRemove)} disabled={saving||(tagsToAdd.length===0&&tagsToRemove.length===0)} style={{ background:(tagsToAdd.length>0||tagsToRemove.length>0)&&!saving?"#e67e22":"#d5d0cb", color:"#fff", border:"none", borderRadius:8, padding:"6px 14px", fontSize:13, fontWeight:600, cursor:(tagsToAdd.length>0||tagsToRemove.length>0)&&!saving?"pointer":"default" }}>{saving?t("batchProcessing"):t("batchApply")}</button>
            </div>
          </div>
          <p style={{ fontSize:11, color:"#9a9590", margin:"0 0 10px" }}>{t("batchHint")}</p>
          <div style={{ marginBottom:10 }}>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              <button onClick={()=>{ if(tagsToAdd.includes(COVER_TAG)) toggleAdd(COVER_TAG); else if(tagsToRemove.includes(COVER_TAG)) toggleRemove(COVER_TAG); else toggleAdd(COVER_TAG); }} onContextMenu={e=>{e.preventDefault();toggleRemove(COVER_TAG);}} style={{ border:"1px solid", borderRadius:14, padding:"5px 14px", fontSize:13, cursor:"pointer", background:tagsToAdd.includes(COVER_TAG)?"#10b981":tagsToRemove.includes(COVER_TAG)?"#ef4444":"#f9fafb", color:tagsToAdd.includes(COVER_TAG)||tagsToRemove.includes(COVER_TAG)?"#fff":"#6b7280", borderColor:tagsToAdd.includes(COVER_TAG)?"#10b981":tagsToRemove.includes(COVER_TAG)?"#ef4444":"#d1d5db" }}>{tagsToAdd.includes(COVER_TAG)?"+ ":"" }{tagsToRemove.includes(COVER_TAG)?"- ":""}{t("coverTag")}</button>
            </div>
          </div>
          {Object.entries(tagSystem).map(([cat,v],ci)=>{ const col = getCatColor(ci); return (
            <div key={cat} style={{ marginBottom:10 }}>
              <p style={{ fontSize:11, fontWeight:600, color:col.text, margin:"0 0 4px" }}>{v.emoji} {tTag(cat,lang)}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {v.tags.map(tag=>{ const isAdd = tagsToAdd.includes(tag); const isRem = tagsToRemove.includes(tag); return (
                  <button key={tag} onClick={()=>{ if(isAdd) toggleAdd(tag); else if(isRem) toggleRemove(tag); else toggleAdd(tag); }} onContextMenu={e=>{e.preventDefault();toggleRemove(tag);}} style={{ border:"1px solid", borderRadius:14, padding:"4px 12px", fontSize:12, cursor:"pointer", background:isAdd?"#10b981":isRem?"#ef4444":"#f9fafb", color:isAdd||isRem?"#fff":"#6b7280", borderColor:isAdd?"#10b981":isRem?"#ef4444":"#d1d5db" }}>{isAdd?"+ ":""}{isRem?"- ":""}{tTag(tag,lang)}</button>
                ); })}
              </div>
            </div>
          ); })}
          <p style={{ fontSize:11, color:"#b0aaa5", margin:"8px 0 0" }}>{t("batchTip")}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (<div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:"#fafaf8", display:"flex", alignItems:"center", justifyContent:"center" }}><div style={{ textAlign:"center" }}><div style={{ fontSize:48, marginBottom:12 }}>🍳</div><p style={{ color:"#9a9590", fontSize:15 }}>{t("loading")}</p></div></div>);
  }

  if (view === "gallery") {
    const dishesText = t("dishes").replace("{f}", filtered.length).replace("{t}", photos.length);
    return (
      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:"#fafaf8", paddingBottom:batchMode?200:0 }}>
        {showPwModal && <PasswordModal lang={lang} onSuccess={onPwSuccess} onCancel={()=>{setShowPwModal(false);setPendingAction(null);}} />}
        <div style={{ position:"sticky", top:0, zIndex:10, background:"#fafaf8", borderBottom:"1px solid #e8e5e0", padding:"14px 16px 12px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ flex:1, minWidth:0 }}>
              {tagMgr.editTitle ? (
                <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                  <input value={tagMgr.editTitleVal} onChange={e=>setTagMgr(p=>({...p,editTitleVal:e.target.value}))} onKeyDown={e=>{ if(e.key==="Enter"){ if(tagMgr.editTitleVal.trim()) saveTitle(tagMgr.editTitleVal.trim()); setTagMgr(p=>({...p,editTitle:false})); }}} autoFocus style={{ flex:1, padding:"4px 8px", border:"1px solid #d5d0cb", borderRadius:6, fontSize:16, fontWeight:700, outline:"none", minWidth:0 }} />
                  <button onClick={()=>{ if(tagMgr.editTitleVal.trim()) saveTitle(tagMgr.editTitleVal.trim()); setTagMgr(p=>({...p,editTitle:false})); }} style={{ background:"#e67e22", color:"#fff", border:"none", borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:600, cursor:"pointer", flexShrink:0 }}>{t("ok")}</button>
                </div>
              ) : (
                <div>
                  <h1 style={{ fontSize:20, fontWeight:700, color:"#2d2a26", margin:0, display:"flex", alignItems:"center", gap:4 }}>{TITLE_I18N[lang] || appTitle}{isAdmin && <span onClick={()=>setTagMgr(p=>({...p,editTitle:true,editTitleVal:appTitle}))} style={{ fontSize:12, color:"#c0bbb5", cursor:"pointer" }}>✏️</span>}</h1>
                  <p style={{ fontSize:11, color:"#9a9590", margin:"2px 0 0" }}>{dishesText}</p>
                </div>
              )}
            </div>
            <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0, marginLeft:8 }}>
              <LangSwitch size="sm" />
              {isAdmin && !batchMode && <button onClick={()=>setView("tags")} style={{ background:"#f0eeea", border:"none", borderRadius:18, padding:"7px 10px", fontSize:13, cursor:"pointer" }}>⚙️</button>}
              {isAdmin && !batchMode && <button onClick={()=>setBatchMode(true)} style={{ background:"#f0eeea", border:"none", borderRadius:18, padding:"7px 10px", fontSize:13, cursor:"pointer" }}>☑️</button>}
              {batchMode ? (
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={()=>{setBatchMode(false);setBatchSelected([]);}} style={{ background:"#f0eeea", border:"none", borderRadius:18, padding:"7px 12px", fontSize:13, cursor:"pointer", color:"#6b6560" }}>{t("cancel")}</button>
                  {batchSelected.length > 0 && <button onClick={()=>setBatchTagging(true)} style={{ background:"#e67e22", color:"#fff", border:"none", borderRadius:18, padding:"7px 12px", fontSize:13, fontWeight:600, cursor:"pointer" }}>{t("tags")} ({batchSelected.length})</button>}
                </div>
              ) : (
                <button onClick={()=>requireAdmin(()=>setView("upload"))} style={{ background:"#e67e22", color:"#fff", border:"none", borderRadius:18, padding:"7px 14px", fontSize:13, fontWeight:600, cursor:"pointer" }}>{isAdmin ? t("add") : t("admin")}</button>
              )}
            </div>
          </div>
          <div style={{ display:"flex", gap:6, marginBottom:8, overflowX:"auto", WebkitOverflowScrolling:"touch" }}>
            <button onClick={()=>{setSpecialFilter("cover");setFilterCat(null);setSelectedTags([]);}} style={{ flexShrink:0, border:"1px solid", borderRadius:14, padding:"4px 12px", fontSize:12, fontWeight:500, cursor:"pointer", background:specialFilter==="cover"?"#f59e0b":"#fff", color:specialFilter==="cover"?"#fff":"#b45309", borderColor:specialFilter==="cover"?"#f59e0b":"#fcd34d" }}>{t("cover")}</button>
            <button onClick={()=>{setSpecialFilter("all");setFilterCat(null);setSelectedTags([]);}} style={{ flexShrink:0, border:"1px solid", borderRadius:14, padding:"4px 12px", fontSize:12, fontWeight:500, cursor:"pointer", background:specialFilter==="all"?"#2d2a26":"#fff", color:specialFilter==="all"?"#fff":"#6b6560", borderColor:specialFilter==="all"?"#2d2a26":"#d5d0cb" }}>{t("all")}</button>
            {Object.entries(tagSystem).map(([cat,v],ci)=>{ const col=getCatColor(ci); const isActive = specialFilter===null && filterCat===cat; return (
              <button key={cat} onClick={()=>{setSpecialFilter(null);setFilterCat(filterCat===cat?null:cat);setSelectedTags([]);}} style={{ flexShrink:0, border:"1px solid", borderRadius:14, padding:"4px 12px", fontSize:12, fontWeight:500, cursor:"pointer", background:isActive?col.active:"#fff", color:isActive?"#fff":col.text, borderColor:isActive?col.active:"#d5d0cb" }}>{v.emoji} {tTag(cat,lang)}</button>
            ); })}
          </div>
          {specialFilter===null && filterCat && tagSystem[filterCat] && (
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {tagSystem[filterCat].tags.map(tag=>{ const ci=Object.keys(tagSystem).indexOf(filterCat); const col=getCatColor(ci); return (
                <button key={tag} onClick={()=>toggleFilter(tag)} style={{ border:"1px solid", borderRadius:14, padding:"4px 12px", fontSize:12, fontWeight:500, cursor:"pointer", background:selectedTags.includes(tag)?col.active:col.bg, color:selectedTags.includes(tag)?"#fff":col.text, borderColor:selectedTags.includes(tag)?col.active:col.border }}>{tTag(tag,lang)}</button>
              ); })}
            </div>
          )}
          {selectedTags.length>0 && (
            <div style={{ display:"flex", gap:4, flexWrap:"wrap", marginTop:8, alignItems:"center" }}>
              <span style={{ fontSize:11, color:"#9a9590" }}>{t("filter")}</span>
              {selectedTags.map(tg=><TagPill key={tg} tag={tg} small tagSystem={tagSystem} lang={lang} />)}
              <button onClick={()=>setSelectedTags([])} style={{ background:"none", border:"none", fontSize:11, color:"#e67e22", cursor:"pointer", fontWeight:600 }}>{t("clearFilter")}</button>
            </div>
          )}
        </div>
        {filtered.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px", color:"#9a9590" }}>
            <div style={{ fontSize:48, marginBottom:12 }}>{specialFilter==="cover"?"⭐":photos.length===0?"📷":"🔍"}</div>
            <p style={{ fontSize:15 }}>{specialFilter==="cover"?t("noCover"):photos.length===0?t("noPhotos"):t("noMatch")}</p>
            {specialFilter==="cover" && photos.length>0 && <p style={{ fontSize:13 }}>{t("noCoverHint")}</p>}
          </div>
        ) : (
          <div style={{ padding:8, display:"flex", gap:8 }}>
            {[0,1].map(col=>(<div key={col} style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
              {filtered.filter((_,i)=>i%2===col).map(p=>{ const displayTags = getDisplayTags(p.tags); return (
                <div key={p.id} onClick={()=>{ if (batchMode) { toggleBatchSelect(p.id); return; } setDetail(p);setView("detail"); }} style={{ cursor:"pointer", borderRadius:10, overflow:"hidden", background:"#fff", boxShadow:"0 1px 3px rgba(0,0,0,0.06)", position:"relative", outline: batchSelected.includes(p.id) ? "3px solid #e67e22" : "none" }}>
                  {batchMode && <div style={{ position:"absolute", top:6, left:6, width:24, height:24, borderRadius:"50%", background:batchSelected.includes(p.id)?"#e67e22":"rgba(255,255,255,0.8)", border:batchSelected.includes(p.id)?"none":"2px solid #d5d0cb", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2 }}>{batchSelected.includes(p.id) && <span style={{ color:"#fff", fontSize:14, fontWeight:700 }}>✓</span>}</div>}
                  <img src={p.image} style={{ width:"100%", display:"block" }} alt="" />
                  <div style={{ padding:"8px 10px 10px" }}>
                    <p style={{ fontSize:13, fontWeight:600, color:"#2d2a26", margin:"0 0 5px", lineHeight:1.3 }}>{getName(p)}</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                      {displayTags.slice(0,3).map(tg=><TagPill key={tg} tag={tg} small tagSystem={tagSystem} lang={lang} />)}
                      {displayTags.length>3 && <span style={{ fontSize:10, color:"#9a9590" }}>+{displayTags.length-3}</span>}
                    </div>
                  </div>
                </div>
              ); })}
            </div>))}
          </div>
        )}
        {batchTagging && <BatchTagPanel />}
      </div>
    );
  }

  if (view === "upload") {
    return <PhotoForm data={upload} setData={setUpload} onSave={saveNew} title={t("addDish")} isSaving={saving} fRef={fileRef} onBack={()=>{setView("gallery");setUpload({image:null,file:null,names:{zh:"",ja:"",en:""},tags:[]});}} />;
  }

  if (view === "edit" && editing) {
    return <PhotoForm data={editing} setData={setEditing} onSave={saveEdit} title={t("editDish")} isSaving={saving} fRef={editFileRef} onBack={()=>{setEditing(null);setView("detail");}} />;
  }

  if (view === "detail" && detail) {
    return (
      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:"#fafaf8" }}>
        {showPwModal && <PasswordModal lang={lang} onSuccess={onPwSuccess} onCancel={()=>{setShowPwModal(false);setPendingAction(null);}} />}
        <div style={{ position:"sticky", top:0, zIndex:10, background:"#fafaf8", borderBottom:"1px solid #e8e5e0", padding:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={()=>setView("gallery")} style={{ background:"none", border:"none", fontSize:15, color:"#6b6560", cursor:"pointer" }}>{t("back")}</button>
          <LangSwitch size="sm" />
          {isAdmin ? (
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>{setEditing({...detail});setView("edit");}} style={{ background:"none", border:"none", fontSize:14, color:"#e67e22", cursor:"pointer", fontWeight:600 }}>{t("edit")}</button>
              <button onClick={()=>del(detail.id)} style={{ background:"none", border:"none", fontSize:14, color:"#e74c3c", cursor:"pointer" }}>{t("delete")}</button>
            </div>
          ) : <div style={{ width:40 }} />}
        </div>
        <img src={detail.image} style={{ width:"100%", display:"block" }} alt="" />
        <div style={{ padding:16 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:"#2d2a26", margin:"0 0 2px" }}>{getName(detail)}</h2>
          {LANGS.filter(l=>l!==lang&&detail.names[l]).map(l=>(<p key={l} style={{ fontSize:13, color:"#9a9590", margin:"1px 0" }}>{detail.names[l]}</p>))}
          <p style={{ fontSize:12, color:"#b0aaa5", margin:"8px 0 12px" }}>{detail.date}</p>
          {detail.tags.includes(COVER_TAG) && <div style={{ marginBottom:8 }}><TagPill tag={COVER_TAG} tagSystem={tagSystem} lang={lang} /></div>}
          {Object.entries(tagSystem).map(([cat,v],ci)=>{ const matching=detail.tags.filter(tg=>v.tags.includes(tg)); if(!matching.length) return null; return (
            <div key={cat} style={{ marginBottom:8, display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, color:"#9a9590" }}>{v.emoji} {tTag(cat,lang)}：</span>
              {matching.map(tg=><TagPill key={tg} tag={tg} tagSystem={tagSystem} lang={lang} />)}
            </div>
          ); })}
        </div>
      </div>
    );
  }

  if (view === "tags") {
    return (
      <div style={{ maxWidth:480, margin:"0 auto", minHeight:"100vh", background:"#fafaf8" }}>
        <div style={{ position:"sticky", top:0, zIndex:10, background:"#fafaf8", borderBottom:"1px solid #e8e5e0", padding:16, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <button onClick={()=>{setView("gallery");setTagMgr(p=>({...p,editingCat:null,renamingCat:null,confirmDeleteCat:null}));}} style={{ background:"none", border:"none", fontSize:15, color:"#6b6560", cursor:"pointer" }}>{t("back")}</button>
          <h2 style={{ fontSize:17, fontWeight:600, color:"#2d2a26", margin:0 }}>{t("tagMgmt")}</h2>
          <div style={{ width:40 }} />
        </div>
        <div style={{ padding:16 }}>
          <div style={{ background:"#fffbeb", borderRadius:12, padding:14, marginBottom:12, border:"1px solid #fcd34d" }}>
            <p style={{ fontSize:13, fontWeight:600, color:"#b45309", margin:0 }}>{t("coverTagTitle")}</p>
            <p style={{ fontSize:12, color:"#92400e", margin:"4px 0 0" }}>{t("coverTagDesc")}</p>
          </div>
          {Object.entries(tagSystem).map(([cat,v],ci)=>{ const col=getCatColor(ci); const isEditing=tagMgr.editingCat===cat; const isRenaming=tagMgr.renamingCat===cat; return (
            <div key={cat} style={{ background:"#fff", borderRadius:12, padding:14, marginBottom:12, border:"1px solid " + col.border }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                {isRenaming ? (
                  <div style={{ display:"flex", gap:6, alignItems:"center", flex:1 }}>
                    <input value={tagMgr.renameCatName} onChange={e=>setTagMgr(p=>({...p,renameCatName:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&renameCategory(cat)} autoFocus style={{ flex:1, padding:"5px 8px", border:"1px solid #d5d0cb", borderRadius:6, fontSize:14, outline:"none" }} />
                    <button onClick={()=>renameCategory(cat)} style={{ background:col.active, color:"#fff", border:"none", borderRadius:6, padding:"5px 10px", fontSize:12, cursor:"pointer" }}>{t("ok")}</button>
                    <button onClick={()=>setTagMgr(p=>({...p,renamingCat:null}))} style={{ background:"#f0eeea", border:"none", borderRadius:6, padding:"5px 10px", fontSize:12, cursor:"pointer", color:"#6b6560" }}>{t("cancel")}</button>
                  </div>
                ) : (<>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <select value={v.emoji} onChange={e=>setCatEmoji(cat,e.target.value)} style={{ border:"none", background:"transparent", fontSize:18, cursor:"pointer", padding:0 }}>{EMOJIS.map(em=><option key={em} value={em}>{em}</option>)}</select>
                    <span style={{ fontSize:15, fontWeight:600, color:col.text }}>{tTag(cat,lang)}</span>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    <button onClick={()=>setTagMgr(p=>({...p,renamingCat:cat,renameCatName:cat}))} style={{ background:"#f0eeea", border:"none", borderRadius:6, padding:"4px 8px", fontSize:11, cursor:"pointer", color:"#6b6560" }}>{t("rename")}</button>
                    <button onClick={()=>setTagMgr(p=>({...p,editingCat:isEditing?null:cat}))} style={{ background:col.bg, border:"1px solid " + col.border, borderRadius:6, padding:"4px 8px", fontSize:11, cursor:"pointer", color:col.text }}>{isEditing?t("collapse"):t("editBtn")}</button>
                    {tagMgr.confirmDeleteCat===cat ? (
                      <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                        <span style={{ fontSize:11, color:"#991b1b" }}>{t("confirmQ")}</span>
                        <button onClick={()=>deleteCategory(cat)} style={{ background:"#ef4444", color:"#fff", border:"none", borderRadius:6, padding:"4px 8px", fontSize:11, cursor:"pointer" }}>{t("yes")}</button>
                        <button onClick={()=>setTagMgr(p=>({...p,confirmDeleteCat:null}))} style={{ background:"#f0eeea", border:"none", borderRadius:6, padding:"4px 8px", fontSize:11, cursor:"pointer", color:"#6b6560" }}>{t("no")}</button>
                      </div>
                    ) : (
                      <button onClick={()=>setTagMgr(p=>({...p,confirmDeleteCat:cat}))} style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:6, padding:"4px 8px", fontSize:11, cursor:"pointer", color:"#991b1b" }}>{t("deleteBtn")}</button>
                    )}
                  </div>
                </>)}
              </div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {v.tags.map(tag=>{ const isRenamingThis = isEditing && tagMgr.renamingTag===cat+":"+tag;
                  if (isRenamingThis) return (
                    <div key={tag} style={{ display:"inline-flex", gap:4, alignItems:"center" }}>
                      <input value={tagMgr.renameTagVal} onChange={e=>setTagMgr(p=>({...p,renameTagVal:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter")renameTag(cat,tag);if(e.key==="Escape")setTagMgr(p=>({...p,renamingTag:null}));}} autoFocus style={{ padding:"3px 8px", border:"1px solid " + col.border, borderRadius:6, fontSize:12, outline:"none", width:80 }} />
                      <button onClick={()=>renameTag(cat,tag)} style={{ background:col.active, color:"#fff", border:"none", borderRadius:6, padding:"3px 8px", fontSize:11, cursor:"pointer" }}>{t("ok")}</button>
                      <button onClick={()=>setTagMgr(p=>({...p,renamingTag:null}))} style={{ background:"#f0eeea", border:"none", borderRadius:6, padding:"3px 8px", fontSize:11, cursor:"pointer", color:"#6b6560" }}>{t("cancel")}</button>
                    </div>
                  );
                  return (
                    <div key={tag} style={{ display:"inline-flex", alignItems:"stretch" }}>
                      <span onClick={isEditing?()=>setTagMgr(p=>({...p,renamingTag:cat+":"+tag,renameTagVal:tag})):undefined} style={{ background:col.bg, color:col.text, border:"1px solid " + col.border, borderRadius:isEditing?"8px 0 0 8px":"12px", padding:"4px 10px", fontSize:12, borderRight:isEditing?"none":undefined, cursor:isEditing?"pointer":"default" }}>{tTag(tag,lang)}{isEditing && <span style={{ marginLeft:3, fontSize:10, opacity:0.5 }}>✏️</span>}</span>
                      {isEditing && <button onClick={()=>deleteTag(cat,tag)} style={{ background:"#fef2f2", color:"#ef4444", border:"1px solid #fca5a5", borderRadius:"0 8px 8px 0", padding:"0 8px", fontSize:14, cursor:"pointer", lineHeight:1, display:"flex", alignItems:"center" }}>✕</button>}
                    </div>
                  );
                })}
              </div>
              {isEditing && (
                <div style={{ display:"flex", gap:6, marginTop:10 }}>
                  <input value={tagMgr.newTagText[cat]||""} onChange={e=>setTagMgr(p=>({...p,newTagText:{...p.newTagText,[cat]:e.target.value}}))} onKeyDown={e=>e.key==="Enter"&&addTag(cat)} placeholder={t("newTagPlaceholder")} style={{ flex:1, padding:"7px 10px", border:"1px solid #d5d0cb", borderRadius:8, fontSize:13, outline:"none" }} />
                  <button onClick={()=>addTag(cat)} style={{ background:col.active, color:"#fff", border:"none", borderRadius:8, padding:"7px 14px", fontSize:13, fontWeight:600, cursor:"pointer" }}>{t("addBtn")}</button>
                </div>
              )}
            </div>
          ); })}
          <div style={{ background:"#fff", borderRadius:12, padding:14, border:"2px dashed #d5d0cb" }}>
            <p style={{ fontSize:13, fontWeight:600, color:"#6b6560", margin:"0 0 10px" }}>{t("addCategory")}</p>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              <select value={tagMgr.newCatEmoji} onChange={e=>setTagMgr(p=>({...p,newCatEmoji:e.target.value}))} style={{ border:"1px solid #d5d0cb", borderRadius:8, padding:"7px 4px", fontSize:18, background:"#fff", cursor:"pointer" }}>{EMOJIS.map(em=><option key={em} value={em}>{em}</option>)}</select>
              <input value={tagMgr.newCatName} onChange={e=>setTagMgr(p=>({...p,newCatName:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addCategory()} placeholder={t("catNamePlaceholder")} style={{ flex:1, padding:"8px 10px", border:"1px solid #d5d0cb", borderRadius:8, fontSize:14, outline:"none" }} />
              <button onClick={addCategory} style={{ background:"#2d2a26", color:"#fff", border:"none", borderRadius:8, padding:"8px 14px", fontSize:13, fontWeight:600, cursor:"pointer" }}>{t("createBtn")}</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
