import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Sparkles, SlidersHorizontal, Layers } from 'lucide-react';

export const DesignSystemPage: React.FC = () => {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      <div className="border-b pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Host Pilot Design System</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {isEn ? 'Design System & Component Library (UI Showcase)' : 'ডিজাইন সিস্টেম ও কম্পোনেন্ট লাইব্রেরি (UI Showcase)'}
        </h1>
        <p className="text-sm text-gray-600">
          {isEn
            ? 'Light theme, Emerald semantic tokens, Inter & Noto Sans Bengali typography and accessible shadcn/ui components.'
            : 'Light theme, Emerald semantic tokens, ইন্টার ও নটো সান্স বেঙ্গলি টাইপোগ্রাফি এবং অ্যাক্সেসিবল shadcn/ui কম্পোনেন্টস।'}
        </p>
      </div>

      {/* 1. Buttons */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <span>{isEn ? '1. Button Variants' : '১. বাটন ভ্যারিয়েন্টস (Buttons)'}</span>
        </h2>
        <div className="flex flex-wrap items-center gap-3 p-6 bg-white rounded-xl border border-border">
          <Button variant="default">Primary Emerald</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link Button</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* 2. Form Inputs & Select */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-emerald-600" />
          <span>{isEn ? '2. Form Inputs & Controls' : '২. ফর্ম ইনপুট ও কন্ট্রোলস (Inputs & Select)'}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-xl border border-border">
          <div className="space-y-2">
            <Label htmlFor="demo-name">{isEn ? 'Student Name (Standard Input)' : 'শিক্ষার্থীর নাম (Standard Input)'}</Label>
            <Input id="demo-name" placeholder={isEn ? 'e.g. Tanvir Ahmed' : 'যেমন: তানভীর আহমেদ'} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-error">{isEn ? 'Error State Input' : 'ত্রুটিযুক্ত ইনপুট (Error Input)'}</Label>
            <Input id="demo-error" error defaultValue={isEn ? 'invalid-format' : 'ভুল ফরম্যাট'} />
            <p className="text-xs text-destructive">{isEn ? 'Please provide a valid email.' : 'সঠিক ইমেইল ঠিকানা প্রদান করুন।'}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-select">{isEn ? 'Room Category (Select)' : 'রুম ক্যাটাগরি (Select)'}</Label>
            <Select defaultValue="double">
              <SelectTrigger id="demo-select">
                <SelectValue placeholder={isEn ? 'Select a room' : 'রুম নির্বাচন করুন'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">{isEn ? 'Single Room (1 Bed)' : 'সিঙ্গেল রুম (১ বেড)'}</SelectItem>
                <SelectItem value="double">{isEn ? 'Double Room (2 Beds)' : 'ডাবল রুম (২ বেড)'}</SelectItem>
                <SelectItem value="quad">{isEn ? 'Four-Bed Room (4 Beds)' : 'ফোর-বেড রুম (৪ বেড)'}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="demo-textarea">{isEn ? 'Address or Remarks (Textarea)' : 'ঠিকানা বা মন্তব্য (Textarea)'}</Label>
            <Textarea id="demo-textarea" placeholder={isEn ? 'Write your address...' : 'আপনার স্থায়ী ঠিকানা লিখুন...'} rows={3} />
          </div>
        </div>
      </section>

      {/* 3. Badges & Status Indicators */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{isEn ? '3. Badges & Status Indicators' : '৩. ব্যাজ ও স্ট্যাটাস ইন্ডিকেটর (Badges)'}</h2>
        <div className="space-y-4 p-6 bg-white rounded-xl border border-border">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-gray-500 mr-2">{isEn ? 'General Badges:' : 'সাধারণ ব্যাজ:'}</span>
            <Badge variant="default">Emerald</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
          </div>
          <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-border">
            <span className="text-xs font-semibold text-gray-500 mr-2">{isEn ? 'Hostel Domain Status:' : 'হোস্টেল ডোমেইন স্ট্যাটাস:'}</span>
            <StatusBadge status="ACTIVE" />
            <StatusBadge status="PAID" />
            <StatusBadge status="PENDING" />
            <StatusBadge status="DUE" />
            <StatusBadge status="AVAILABLE" />
            <StatusBadge status="OCCUPIED" />
          </div>
        </div>
      </section>

      {/* 4. Cards */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{isEn ? '4. Card Components' : '৪. কার্ড কম্পোনেন্ট (Cards)'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{isEn ? 'Room 204 (Shared Bed)' : 'রুম ২০৪ (শেয়ার্ড বেড)'}</CardTitle>
              <CardDescription>{isEn ? '2nd Floor, south-facing airy clean room.' : '২য় তলা, দক্ষিণমুখী আলো-বাতাসপূর্ণ পরিচ্ছন্ন কক্ষ।'}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{isEn ? 'Current Occupancy: 1/2 students. 1 bed available.' : 'উপস্থিত শিক্ষার্থী: ১/২ জন। একজন শিক্ষার্থীর জন্য একটি সিট খালি রয়েছে।'}</p>
            </CardContent>
            <CardFooter className="justify-between">
              <StatusBadge status="AVAILABLE" />
              <Button size="sm">{isEn ? 'View Details' : 'বিস্তারিত দেখুন'}</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{isEn ? 'Monthly Rent Invoice' : 'মাসিক ভাড়া চালান'}</CardTitle>
              <CardDescription>{isEn ? 'Scheduled hostel charge for current month.' : 'নভেম্বর ২০২৬ সেশনের নির্ধারিত হোস্টেল চার্জ।'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm">
                <span>{isEn ? 'Total Due:' : 'মোট বকেয়া:'}</span>
                <span className="font-extrabold text-emerald-700 text-base">{isEn ? '$50 / ৳ 5,000' : '৳ ৫,০০০'}</span>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <StatusBadge status="PAID" />
              <Button size="sm" variant="outline">{isEn ? 'Download Receipt' : 'রসিদ ডাউনলোড'}</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* 4. Feedback Alerts */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{isEn ? '5. Feedback Alerts' : '৫. ফিডব্যাক অ্যালার্ট (Feedback Alerts)'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Alert variant="success">
            <AlertTitle>{isEn ? 'Application Submitted!' : 'আবেদন সফল!'}</AlertTitle>
            <AlertDescription>
              {isEn ? 'Your admission application has been received and is pending admin review.' : 'আপনার ভর্তি আবেদন গৃহীত হয়েছে এবং অ্যাডমিন প্যানেলে অপেক্ষমান রয়েছে।'}
            </AlertDescription>
          </Alert>
          <Alert variant="warning">
            <AlertTitle>{isEn ? 'Payment Due Notice' : 'পেমেন্ট বকেয়া নোটিশ'}</AlertTitle>
            <AlertDescription>
              {isEn ? 'Please pay your current month hostel rent within the next 10 days.' : 'চলতি মাসের সিট ভাড়া আগামী ১০ দিনের মধ্যে পরিশোধ করার অনুরোধ করা হলো।'}
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* 5. Dialog & Sheet */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{isEn ? '6. Dialog & Drawer' : '৬. ডায়ালগ ও ড্রয়ার (Dialog & Sheet)'}</h2>
        <div className="flex flex-wrap gap-4 p-6 bg-white rounded-xl border border-border">
          {/* Dialog Trigger */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">{isEn ? 'Open Dialog' : 'ডায়ালগ উইন্ডো খুলুন (Open Dialog)'}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isEn ? 'Bed Allocation Details' : 'বেড বরাদ্দের বিবরণ'}</DialogTitle>
                <DialogDescription>
                  {isEn ? 'Room 204, Bed B. Do you wish to allocate this bed to the selected student?' : 'রুম নং ২০৪, বেড B। আপনি কি এই শিক্ষার্থীকে উক্ত সিটে বরাদ্দ দিতে চান?'}
                </DialogDescription>
              </DialogHeader>
              <div className="p-3 bg-muted rounded-md text-xs text-muted-foreground">
                {isEn ? 'Clicking confirm will record the allocation into the database.' : 'কনফার্ম বাটনে ক্লিক করলে ডাটাবেজে বরাদ্দের হিস্ট্রি সংরক্ষিত হবে।'}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  {isEn ? 'Cancel' : 'বাতিল'}
                </Button>
                <Button onClick={() => setDialogOpen(false)}>{isEn ? 'Confirm Allocation' : 'বরাদ্দ নিশ্চিত করুন'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Sheet Trigger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="secondary">{isEn ? 'Open Sheet' : 'স্লাইড-ওভার ড্রয়ার খুলুন (Open Sheet)'}</Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>{isEn ? 'Sidebar Drawer Menu' : 'সাইডবার ড্রয়ার মেনু'}</SheetTitle>
                <SheetDescription>
                  {isEn ? 'Used as a slide-over panel on mobile and tablet interfaces.' : 'মোবাইল ও ট্যাবলেট ইন্টারফেসে স্লাইড-ওভার প্যানেল হিসেবে ব্যবহৃত।'}
                </SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-3">
                <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800">
                  {isEn ? 'Drawer successfully opened.' : 'সফলভাবে স্লাইড ড্রয়ার সক্রিয় হয়েছে।'}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </section>

      {/* 6. Table */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{isEn ? '7. Responsive Table' : '৭. রেসপনসিভ টেবিল (Table)'}</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isEn ? 'Room No' : 'রুম নং'}</TableHead>
              <TableHead>{isEn ? 'Type' : 'ধরন'}</TableHead>
              <TableHead>{isEn ? 'Capacity' : 'মোট বেড'}</TableHead>
              <TableHead>{isEn ? 'Monthly Rent' : 'মাসিক ভাড়া'}</TableHead>
              <TableHead>{isEn ? 'Status' : 'স্ট্যাটাস'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">101</TableCell>
              <TableCell>{isEn ? 'Single' : 'সিঙ্গেল'}</TableCell>
              <TableCell>1</TableCell>
              <TableCell>{isEn ? '$80 / ৳ 8,000' : '৳ ৮,০০০'}</TableCell>
              <TableCell><StatusBadge status="AVAILABLE" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">102</TableCell>
              <TableCell>{isEn ? 'Double' : 'ডাবল'}</TableCell>
              <TableCell>2</TableCell>
              <TableCell>{isEn ? '$50 / ৳ 5,000' : '৳ ৫,০০০'}</TableCell>
              <TableCell><StatusBadge status="OCCUPIED" /></TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-bold">201</TableCell>
              <TableCell>{isEn ? 'Four-Bed' : 'ফোর-বেড'}</TableCell>
              <TableCell>4</TableCell>
              <TableCell>{isEn ? '$35 / ৳ 3,500' : '৳ ৩,৫০০'}</TableCell>
              <TableCell><StatusBadge status="AVAILABLE" /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      {/* 7. Skeleton Loading Placeholder */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">{isEn ? '8. Skeleton Loading' : '৮. স্কেলিটন লোডার (Skeleton Loading)'}</h2>
        <div className="p-6 bg-white rounded-xl border border-border space-y-3">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
