
import { Dexie, type Table } from 'dexie';
import { Question, ExamBlueprint, GeneratedExam } from './types';

// QBankDB handles the IndexedDB storage for questions, blueprints, and generated exams.
export class QBankDB extends Dexie {
  questions!: Table<Question>;
  blueprints!: Table<ExamBlueprint>;
  exams!: Table<GeneratedExam>;

  constructor() {
    super('QBankVNDatabase');
    // Cập nhật: Sử dụng 'id' thay vì '++id' vì chúng ta sử dụng UUID string
    (this as any).version(2).stores({
      questions: 'id, capHoc, monHoc, lop, chuDe, mucDo, dangCau, timesUsed',
      blueprints: 'id, monHoc, lop, createdAt',
      exams: 'id, blueprintId, maDe, createdAt'
    });
  }
}

export const db = new QBankDB();
