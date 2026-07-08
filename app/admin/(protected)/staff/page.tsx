import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/format";
import { StaffForm } from "@/components/admin/StaffForm";
import { RoleSelect } from "@/components/admin/RoleSelect";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteStaff } from "./actions";
import { requireManagerSession } from "@/lib/admin/permissions";

export default async function AdminStaffPage() {
  const admin = await requireManagerSession();
  const staff = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <h1 className="text-2xl font-bold text-espresso">Staff</h1>
      <p className="mt-1 text-sm text-espresso/60">
        Managers have full access. Cashiers can view and update orders and customers only.
      </p>

      <div className="mt-6">
        <StaffForm />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-tan/50 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-tan/50 bg-beige/50 text-xs font-bold uppercase text-espresso/70">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Added</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tan/30">
            {staff.map((s) => {
              const isSelf = s.id === admin.id;
              const boundDelete = deleteStaff.bind(null, s.id);
              return (
                <tr key={s.id}>
                  <td className="px-4 py-3 font-semibold text-espresso">
                    {s.name}
                    {isSelf && <span className="ml-1.5 text-xs font-normal text-espresso/50">(you)</span>}
                  </td>
                  <td className="px-4 py-3 text-espresso/70">{s.email}</td>
                  <td className="px-4 py-3">
                    <RoleSelect id={s.id} role={s.role} disabled={isSelf} />
                  </td>
                  <td className="px-4 py-3 text-espresso/70">{formatDate(s.createdAt.toISOString())}</td>
                  <td className="px-4 py-3">
                    {!isSelf && (
                      <DeleteButton
                        action={boundDelete}
                        label="Delete"
                        confirmMessage={`Remove staff account "${s.name}" (${s.email})? This can't be undone.`}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
