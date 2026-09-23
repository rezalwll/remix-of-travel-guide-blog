import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Heart,
  Plus,
  Save,
  Send,
  Trash2,
  WalletCards,
} from "lucide-react";
import { Link, useLocation, useParams } from "@/lib/router";
import Layout from "@/components/layout/Layout";
import { PersianDatePicker } from "@/components/ui/PersianDatePicker";
import { AccountLayout } from "@/components/account/AccountLayout";
import { useAuth } from "@/context/AuthContext";
import {
  backend,
  type ApiFavorite,
  type ApiNotification,
  type ApiOrder,
  type ApiPassenger,
  type ApiRefund,
  type ApiSupportTicket,
  type ApiVisaApplication,
  type ApiWallet,
} from "@/services/backend";
import {
  orderTitle,
  paymentReference,
  serviceLabel,
  travelerName,
} from "@/services/orderView";
import { formatPrice } from "@/utils/flight";
import { viewForBookingStatus } from "@/types/order";

const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`rounded-2xl border border-border bg-card p-4 sm:p-5 ${className}`}
  >
    {children}
  </section>
);
const Empty = ({ text, href = "/" }: { text: string; href?: string }) => (
  <div className="py-12 text-center">
    <p className="text-sm text-muted-foreground">{text}</p>
    <Link
      to={href}
      className="mt-4 inline-block text-sm font-bold text-primary"
    >
      مشاهده گزینه‌ها
    </Link>
  </div>
);
const Status = ({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "good" | "warn" | "muted";
}) => (
  <span
    className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone === "good" ? "bg-secondary/10 text-secondary" : tone === "warn" ? "bg-warning/10 text-warning" : "bg-muted text-muted-foreground"}`}
  >
    {children}
  </span>
);

type AccountData = {
  orders: ApiOrder[];
  wallet: ApiWallet | null;
  passengers: ApiPassenger[];
  refunds: ApiRefund[];
  favorites: ApiFavorite[];
  notifications: ApiNotification[];
  tickets: ApiSupportTicket[];
  visa: ApiVisaApplication[];
};

const emptyData: AccountData = {
  orders: [],
  wallet: null,
  passengers: [],
  refunds: [],
  favorites: [],
  notifications: [],
  tickets: [],
  visa: [],
};

const OrderRow = ({ order }: { order: ApiOrder }) => (
  <Link
    to={`/account/orders/${order.id}`}
    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-4 transition hover:border-secondary"
  >
    <div>
      <p className="text-xs text-muted-foreground">
        {order.orderNumber} · {serviceLabel(order.serviceType)}
      </p>
      <p className="mt-1 font-bold">{orderTitle(order)}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {new Date(order.createdAt).toLocaleDateString("fa-IR")} ·{" "}
        {paymentReference(order)}
      </p>
    </div>
    <div className="text-end">
      <Status tone="good">
        {viewForBookingStatus(order.bookingStatus).label}
      </Status>
      <p className="mt-2 text-sm font-extrabold text-primary">
        {formatPrice(order.total)}
      </p>
    </div>
  </Link>
);

export default function AccountPage() {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const { id } = useParams();
  const [data, setData] = useState<AccountData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passengerForm, setPassengerForm] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    passportNumber: "",
  });
  const [ticketForm, setTicketForm] = useState({ subject: "", message: "" });
  const [reply, setReply] = useState("");
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    birthDate: user?.birthDate || "",
    nationalId: user?.nationalId || "",
  });
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setError("");
    try {
      const [
        orders,
        wallet,
        passengers,
        refunds,
        favorites,
        notifications,
        tickets,
        visa,
      ] = await Promise.all([
        backend.orders(),
        backend.wallet(),
        backend.passengers(),
        backend.refunds(),
        backend.favorites(),
        backend.notifications(),
        backend.support(),
        backend.visaApplications(),
      ]);
      setData({
        orders: orders.orders,
        wallet: wallet.wallet,
        passengers: passengers.passengers,
        refunds: refunds.refunds,
        favorites: favorites.favorites,
        notifications: notifications.notifications,
        tickets: tickets.tickets,
        visa: visa.applications,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "دریافت اطلاعات حساب انجام نشد.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void reload();
  }, []);

  const content = useMemo(
    () => location.pathname.split("/")[2] || "dashboard",
    [location.pathname],
  );
  const selectedOrder = id
    ? data.orders.find((order) => order.id === id)
    : undefined;
  const favoriteHref = (item: ApiFavorite) =>
    item.itemType === "hotel"
      ? `/hotels/${item.itemId}`
      : item.itemType === "tour"
        ? `/tours/${item.itemId}`
        : item.itemType === "ziyarat"
          ? `/ziyarat/${item.itemId}`
          : "/destinations";

  const savePassenger = async () => {
    if (!passengerForm.firstName || !passengerForm.lastName) return;
    setSaving(true);
    try {
      await backend.createPassenger(passengerForm);
      setPassengerForm({
        firstName: "",
        lastName: "",
        nationalId: "",
        passportNumber: "",
      });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره مسافر انجام نشد.");
    } finally {
      setSaving(false);
    }
  };
  const createTicket = async () => {
    if (!ticketForm.subject || !ticketForm.message) return;
    setSaving(true);
    try {
      await backend.createSupport(ticketForm.subject, ticketForm.message);
      setTicketForm({ subject: "", message: "" });
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ثبت تیکت انجام نشد.");
    } finally {
      setSaving(false);
    }
  };

  let body: React.ReactNode;
  if (loading)
    body = (
      <Card>
        <p className="py-16 text-center text-sm text-muted-foreground">
          در حال دریافت اطلاعات از سرور...
        </p>
      </Card>
    );
  else if (id)
    body = selectedOrder ? (
      <Card>
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">
              {serviceLabel(selectedOrder.serviceType)}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold">
              {selectedOrder.orderNumber}
            </h2>
          </div>
          <Status tone={viewForBookingStatus(selectedOrder.bookingStatus).tone === "good" ? "good" : "warn"}>{viewForBookingStatus(selectedOrder.bookingStatus).label}</Status>
        </div>
        <div className="mt-5 rounded-xl bg-muted/60 p-4">
          <p className="font-bold">{orderTitle(selectedOrder)}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            پیگیری: {paymentReference(selectedOrder)}
          </p>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {selectedOrder.travelers.map((item, index) => (
            <p
              key={index}
              className="rounded-lg border border-border p-3 text-sm"
            >
              {travelerName(item)}
            </p>
          ))}
        </div>
        <div className="mt-6 border-t border-border pt-4">
          <p className="text-xl font-extrabold text-primary">
            {formatPrice(selectedOrder.total)}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/account/refunds"
              className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white"
            >
              درخواست استرداد
            </Link>
            <Link
              to="/account/support"
              className="rounded-lg border border-border px-3 py-2 text-xs font-bold"
            >
              پشتیبانی
            </Link>
          </div>
        </div>
      </Card>
    ) : (
      <Card>
        <Empty text="سفارش برای این حساب پیدا نشد." href="/account/orders" />
      </Card>
    );
  else if (content === "orders")
    body = (
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">سفارش‌های من</h2>
          <Status>{data.orders.length} سفارش</Status>
        </div>
        {data.orders.length ? (
          <div className="space-y-3">
            {data.orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <Empty text="هنوز سفارشی ندارید." />
        )}
      </Card>
    );
  else if (content === "passengers")
    body = (
      <Card>
        <div className="mb-5 flex items-center gap-2">
          <Plus className="size-5 text-primary" />
          <h2 className="text-xl font-extrabold">مسافران من</h2>
        </div>
        <div className="mb-5 grid gap-3 rounded-xl bg-muted/60 p-4 sm:grid-cols-2">
          <input
            value={passengerForm.firstName}
            onChange={(e) =>
              setPassengerForm({ ...passengerForm, firstName: e.target.value })
            }
            placeholder="نام"
            aria-label="نام مسافر"
            className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <input
            value={passengerForm.lastName}
            onChange={(e) =>
              setPassengerForm({ ...passengerForm, lastName: e.target.value })
            }
            placeholder="نام خانوادگی"
            aria-label="نام خانوادگی مسافر"
            className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <input
            value={passengerForm.nationalId}
            onChange={(e) =>
              setPassengerForm({ ...passengerForm, nationalId: e.target.value })
            }
            placeholder="کد ملی"
            aria-label="کد ملی مسافر"
            dir="ltr"
            className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <input
            value={passengerForm.passportNumber}
            onChange={(e) =>
              setPassengerForm({
                ...passengerForm,
                passportNumber: e.target.value,
              })
            }
            placeholder="شماره گذرنامه"
            aria-label="شماره گذرنامه مسافر"
            dir="ltr"
            className="min-h-10 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => void savePassenger()}
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-xs font-bold text-white"
          >
            <Save className="size-4" /> ذخیره
          </button>
        </div>
        {data.passengers.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.passengers.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between rounded-xl border border-border p-4"
              >
                <div>
                  <p className="font-bold">
                    {item.firstName} {item.lastName}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    کد ملی:{" "}
                    {item.nationalId
                      ? `${item.nationalId.slice(0, 2)}••••${item.nationalId.slice(-2)}`
                      : "ثبت نشده"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void backend.deletePassenger(item.id).then(reload)
                  }
                  aria-label="حذف مسافر"
                  className="text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="مسافری ذخیره نکرده‌اید." />
        )}
      </Card>
    );
  else if (content === "wallet")
    body = (
      <div className="space-y-5">
        <Card>
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-secondary/10 text-secondary">
              <WalletCards className="size-6" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">موجودی کیف پول</p>
              <p className="mt-1 text-2xl font-extrabold">
                {formatPrice(data.wallet?.balance || 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-xl font-extrabold">گردش کیف پول</h2>
          {data.wallet?.transactions.length ? (
            data.wallet.transactions.map((item) => (
              <div
                key={item.id}
                className="mb-2 flex justify-between rounded-lg bg-muted/60 p-3 text-sm"
              >
                <div>
                  <p className="font-bold">
                    {item.type === "debit" ? "برداشت" : item.type}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.reference}
                  </p>
                </div>
                <p className="font-bold">
                  {formatPrice(Math.abs(item.amount))}
                </p>
              </div>
            ))
          ) : (
            <Empty text="هنوز تراکنش کیف پول ندارید." />
          )}
        </Card>
      </div>
    );
  else if (content === "refunds")
    body = (
      <Card>
        <h2 className="mb-5 text-xl font-extrabold">درخواست‌های استرداد</h2>
        {data.refunds.map((item) => (
          <div
            key={item.id}
            className="mb-3 flex justify-between rounded-xl border border-border p-4"
          >
            <div>
              <p className="font-bold">سفارش {item.orderId.slice(-6)}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.reason}
              </p>
            </div>
            <div className="text-end">
              <Status tone="warn">{item.status}</Status>
              <p className="mt-2 text-sm font-bold">
                {formatPrice(item.amount)}
              </p>
            </div>
          </div>
        ))}
        <div className="mt-5 border-t border-border pt-5">
          <p className="mb-3 text-sm font-bold">سفارش‌های قابل درخواست</p>
          {data.orders
            .filter(
              (order) =>
                !data.refunds.some((refund) => refund.orderId === order.id),
            )
            .map((order) => (
              <div
                key={order.id}
                className="mb-2 flex items-center justify-between rounded-lg bg-muted/60 p-3 text-sm"
              >
                <span>{order.orderNumber}</span>
                <button
                  type="button"
                  onClick={() =>
                    void backend
                      .requestRefund(order.id, "تغییر برنامه سفر")
                      .then(reload)
                  }
                  className="rounded-lg border border-primary px-3 py-2 text-xs font-bold text-primary"
                >
                  درخواست استرداد
                </button>
              </div>
            ))}
        </div>
      </Card>
    );
  else if (content === "favorites")
    body = (
      <Card>
        <div className="mb-5 flex items-center gap-2">
          <Heart className="size-5 text-primary" />
          <h2 className="text-xl font-extrabold">علاقه‌مندی‌ها</h2>
        </div>
        {data.favorites.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {data.favorites.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-border p-4"
              >
                <div>
                  <p className="font-bold">{serviceLabel(item.itemType)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.itemId}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={favoriteHref(item)}
                    className="text-xs font-bold text-secondary"
                  >
                    مشاهده
                  </Link>
                  <button
                    type="button"
                    onClick={() =>
                      void backend.deleteFavorite(item.id).then(reload)
                    }
                    className="text-xs font-bold text-destructive"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="علاقه‌مندی ندارید." href="/destinations" />
        )}
      </Card>
    );
  else if (content === "notifications")
    body = (
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="size-5 text-secondary" />
            <h2 className="text-xl font-extrabold">اعلان‌ها</h2>
          </div>
          <button
            type="button"
            onClick={() => void backend.readAllNotifications().then(reload)}
            className="text-xs font-bold text-secondary"
          >
            خواندن همه
          </button>
        </div>
        {data.notifications.length ? (
          data.notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                void backend.readNotification(item.id).then(reload)
              }
              className={`mb-2 w-full rounded-xl border p-4 text-start ${item.readAt ? "border-border" : "border-secondary/40 bg-secondary/5"}`}
            >
              <p className="font-bold">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {item.body}
              </p>
            </button>
          ))
        ) : (
          <Empty text="اعلانی ندارید." />
        )}
      </Card>
    );
  else if (content === "support")
    body = (
      <div className="space-y-5">
        <Card>
          <h2 className="mb-4 text-xl font-extrabold">تیکت جدید</h2>
          <div className="grid gap-3">
            <input
              value={ticketForm.subject}
              onChange={(e) =>
                setTicketForm({ ...ticketForm, subject: e.target.value })
              }
              placeholder="موضوع"
              aria-label="موضوع تیکت"
              className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm"
            />
            <textarea
              value={ticketForm.message}
              onChange={(e) =>
                setTicketForm({ ...ticketForm, message: e.target.value })
              }
              placeholder="شرح درخواست"
              aria-label="شرح درخواست پشتیبانی"
              className="min-h-24 rounded-lg border border-border bg-background px-3 py-3 text-sm"
            />
            <button
              type="button"
              disabled={saving}
              onClick={() => void createTicket()}
              className="w-fit rounded-lg bg-primary px-4 py-3 text-xs font-bold text-white"
            >
              ثبت تیکت
            </button>
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-xl font-extrabold">تیکت‌های من</h2>
          {data.tickets.length ? (
            data.tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="mb-3 rounded-xl border border-border p-4"
              >
                <div className="flex justify-between">
                  <p className="font-bold">{ticket.subject}</p>
                  <Status tone="warn">{ticket.status}</Status>
                </div>
                {ticket.messages.map((message) => (
                  <p
                    key={message.id}
                    className="mt-3 rounded-lg bg-muted p-3 text-xs"
                  >
                    {message.authorType === "customer" ? "شما" : "پشتیبانی"}:{" "}
                    {message.body}
                  </p>
                ))}
                <div className="mt-3 flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="پاسخ"
                    aria-label={`پاسخ به تیکت ${ticket.subject}`}
                    className="min-h-10 flex-1 rounded-lg border border-border px-3 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (reply)
                        void backend.replySupport(ticket.id, reply).then(() => {
                          setReply("");
                          return reload();
                        });
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 text-xs font-bold text-white"
                  >
                    <Send className="size-4" /> ارسال
                  </button>
                </div>
              </div>
            ))
          ) : (
            <Empty text="تیکتی ندارید." />
          )}
        </Card>
      </div>
    );
  else if (content === "visa")
    body = (
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">درخواست‌های ویزا</h2>
          <Link to="/visa" className="text-xs font-bold text-secondary">
            درخواست جدید
          </Link>
        </div>
        {data.visa.length ? (
          data.visa.map((item) => (
            <div
              key={item.id}
              className="mb-3 rounded-xl border border-border p-4"
            >
              <div className="flex justify-between">
                <p className="font-bold">{item.country}</p>
                <Status tone="warn">{item.status}</Status>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                کد درخواست: {item.id}
              </p>
            </div>
          ))
        ) : (
          <Empty text="درخواست ویزایی ندارید." href="/visa" />
        )}
      </Card>
    );
  else if (content === "profile")
    body = (
      <Card>
        <h2 className="mb-5 text-xl font-extrabold">پروفایل</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={profile.firstName}
            onChange={(e) =>
              setProfile({ ...profile, firstName: e.target.value })
            }
            placeholder="نام"
            aria-label="نام"
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <input
            value={profile.lastName}
            onChange={(e) =>
              setProfile({ ...profile, lastName: e.target.value })
            }
            placeholder="نام خانوادگی"
            aria-label="نام خانوادگی"
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <input
            value={user?.mobile || ""}
            readOnly
            dir="ltr"
            className="min-h-11 rounded-lg border border-border bg-muted px-3 text-sm"
          />
          <input
            value={profile.email}
            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            placeholder="ایمیل"
            aria-label="ایمیل"
            dir="ltr"
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm"
          />
          <PersianDatePicker
            label="تاریخ تولد"
            value={profile.birthDate}
            onChange={(birthDate) => setProfile({ ...profile, birthDate })}
          />
          <input
            value={profile.nationalId}
            onChange={(e) =>
              setProfile({ ...profile, nationalId: e.target.value })
            }
            placeholder="کد ملی"
            aria-label="کد ملی"
            dir="ltr"
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-sm"
          />
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            setSaving(true);
            void updateProfile(profile)
              .catch((err) =>
                setError(
                  err instanceof Error
                    ? err.message
                    : "ذخیره پروفایل انجام نشد.",
                ),
              )
              .finally(() => setSaving(false));
          }}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-3 text-xs font-bold text-white"
        >
          <Save className="size-4" /> ذخیره پروفایل
        </button>
      </Card>
    );
  else
    body = (
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Card>
            <p className="text-xs text-muted-foreground">سفارش‌ها</p>
            <p className="mt-2 text-2xl font-extrabold text-primary">
              {data.orders.length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-muted-foreground">اعلان خوانده‌نشده</p>
            <p className="mt-2 text-2xl font-extrabold">
              {data.notifications.filter((item) => !item.readAt).length}
            </p>
          </Card>
          <Card>
            <p className="text-xs text-muted-foreground">موجودی کیف پول</p>
            <p className="mt-2 text-lg font-extrabold text-secondary">
              {formatPrice(data.wallet?.balance || 0)}
            </p>
          </Card>
        </div>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">سفارش‌های اخیر</h2>
            <Link
              to="/account/orders"
              className="text-xs font-bold text-secondary"
            >
              مشاهده همه
            </Link>
          </div>
          {data.orders.length ? (
            <div className="space-y-3">
              {data.orders.slice(0, 3).map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </div>
          ) : (
            <Empty text="هنوز سفارشی ندارید." />
          )}
        </Card>
      </div>
    );

  return (
    <Layout>
      <AccountLayout>
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {body}
      </AccountLayout>
    </Layout>
  );
}
