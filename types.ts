
export type CapHoc = "TieuHoc" | "THCS" | "THPT" | "DungChung";
export type MucDo = "NB" | "TH" | "VD" | "VDC";
export type DangCau = "TracNghiem" | "TuLuan" | "DungSai" | "DienKhuyet";

export interface Question {
  id: string;
  capHoc: CapHoc;
  monHoc: string;
  lop: string;
  chuDe: string;
  chuanKTKN: string;
  mucDo: MucDo;
  dangCau: DangCau;
  noiDung: string;
  luaChon?: { A?: string; B?: string; C?: string; D?: string };
  dapAn: string;
  giaiThichCham: string;
  diem: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  timesUsed: number;
}

export interface BlueprintMatrixCell {
  soCau: number;
  diem: number;
}

export interface ExamBlueprint {
  id: string;
  monHoc: string;
  capHoc: CapHoc;
  lop: string;
  phamViChuDe: string[];
  tongDiem: number;
  tongSoCau: number;
  thoiGian: number;
  tiLeMucDo: { NB: number; TH: number; VD: number; VDC: number };
  tiLeDangCau: { tracNghiem: number; tuLuan: number };
  rangBuoc: {
    khongLapCau: boolean;
    uuTienChuaDungGanDay: boolean;
    xaoCau: boolean;
    xaoDapAn: boolean;
  };
  maTran: {
    [chuDe: string]: {
      [key in MucDo]: BlueprintMatrixCell;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedExam {
  id: string;
  blueprintId: string;
  maDe: string;
  danhSachCauHoi: Array<{ questionId: string; order: number; diem: number }>;
  createdAt: string;
}

export type ViewState = 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5' | 'M6';
