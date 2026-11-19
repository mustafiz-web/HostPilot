import React, { useState } from 'react';
import {
  Bed,
  Users,
  Wifi,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CURRENT_STUDENT_ALLOCATION,
} from './mock-data/student-mock-data';

export const StudentRoomPage: React.FC = () => {
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [changeReason, setChangeReason] = useState('');

  const handleRoomChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setChangeModalOpen(false);
      setChangeReason('');
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Bed className="w-6 h-6 text-emerald-600" />
            <span>আমার রুম ও সিট বরাদ্দ (Room & Bed Allocation)</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            রুমের বিস্তারিত স্পেসিফিকেশন, সুযোগ-সুবিধা এবং সহাবস্থানকারী রুমমেটের বিবরণ
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setChangeModalOpen(true)}
          className="gap-2 shadow-xs self-start sm:self-auto border-emerald-600 text-emerald-700 hover:bg-emerald-50"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>রুম পরিবর্তনের আবেদন</span>
        </Button>
      </div>

      {/* Main Grid: Room Spec Card + Roommate Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Spec Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900">
                  রুম {CURRENT_STUDENT_ALLOCATION.roomNumber}
                </span>
                <span className="bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1 rounded-full text-xs border border-emerald-300">
                  বেড {CURRENT_STUDENT_ALLOCATION.bedCode}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {CURRENT_STUDENT_ALLOCATION.blockName} • {CURRENT_STUDENT_ALLOCATION.floorName}
              </p>
            </div>
            <div className="sm:text-right">
              <div className="text-xl sm:text-2xl font-black text-emerald-700">
                ৳ {CURRENT_STUDENT_ALLOCATION.monthlyRent.toLocaleString()}
              </div>
              <span className="text-xs text-slate-400">প্রতি মাসে নির্ধারিত ভাড়া</span>
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block mb-1">রুমের ধরন:</span>
              <span className="font-bold text-slate-800 text-sm">২ সিট (ডাবল শেয়ার্ড)</span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-slate-400 block mb-1">বরাদ্দের তারিখ:</span>
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {CURRENT_STUDENT_ALLOCATION.allocatedDate}
              </span>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 col-span-2 sm:col-span-1">
              <span className="text-slate-400 block mb-1">বর্তমান সিট স্ট্যাটাস:</span>
              <span className="font-bold text-emerald-700 text-sm flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                সক্রিয় বরাদ্দ (Occupied)
              </span>
            </div>
          </div>

          {/* Amenities & Facility List */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-emerald-600" />
              <span>রুমের অন্তর্ভুক্ত সুযোগ-সুবিধাসমূহ:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CURRENT_STUDENT_ALLOCATION.amenities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 text-xs text-slate-700 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/70"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Roommates Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-base text-slate-900">সহাবস্থানকারী রুমমেট</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            হোস্টেলের জরুরি সমন্বয় ও সৌহার্দ্যপূর্ণ পরিবেশ বজায় রাখার স্বার্থে রুমমেটের মৌলিক তথ্য
          </p>

          <div className="space-y-3 pt-2">
            {CURRENT_STUDENT_ALLOCATION.roommates.map((rm) => (
              <div
                key={rm.id}
                className={`p-4 rounded-xl border transition-all ${
                  rm.isSelf
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs ${
                        rm.isSelf
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {rm.bedCode}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{rm.name}</span>
                        {rm.isSelf && (
                          <span className="text-[10px] bg-emerald-600 text-white font-medium px-1.5 py-0.2 rounded">
                            আমার সিট
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">{rm.department}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="text-slate-400">যোগাযোগ:</span>
                  <span className="font-mono font-medium">{rm.phone}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              রুমের কোনো ফার্নিচার বা ফিক্সচারের ক্ষয়ক্ষতি হলে তাৎক্ষণিকভাবে অভিযোগ সেকশনে রিপোর্ট করুন।
            </span>
          </div>
        </div>
      </div>

      {/* Room Change Request Dialog */}
      <Dialog open={changeModalOpen} onOpenChange={setChangeModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>রুম বা সিট পরিবর্তনের আবেদন</DialogTitle>
            <DialogDescription>
              রুম পরিবর্তনের যৌক্তিক কারণ উল্লেখ করে হোস্টেল সুপারিনটেনডেন্ট বরাবর আবেদন করুন।
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="p-6 bg-emerald-50 rounded-xl text-center space-y-2 border border-emerald-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900">আবেদন গৃহীত হয়েছে!</h4>
              <p className="text-xs text-emerald-700">
                সিট খালি থাকা সাপেক্ষে হোস্টেল কর্তৃপক্ষ আপনার সাথে যোগাযোগ করবে।
              </p>
            </div>
          ) : (
            <form onSubmit={handleRoomChangeSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentRoom" className="text-xs font-semibold">
                  বর্তমান রুম ও সিট
                </Label>
                <div className="p-2.5 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-800">
                  রুম ১০১ (বেড A) • ১ম তলা
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="changeReason" className="text-xs font-semibold">
                  রুম পরিবর্তনের কারণ
                </Label>
                <Textarea
                  id="changeReason"
                  rows={3}
                  placeholder="যেমন: মেডিকেলি নিচতলায় থাকা প্রয়োজন / পড়াশোনার নীরবতার জন্য সিঙ্গেল রুমে স্থানান্তর প্রয়োজন..."
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  required
                />
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setChangeModalOpen(false)}
                >
                  বাতিল
                </Button>
                <Button type="submit">আবেদন দাখিল করুন</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
