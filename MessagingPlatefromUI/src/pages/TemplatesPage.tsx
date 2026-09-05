import { useQuery } from "@tanstack/react-query";
import { FileText, Pencil, Plus, Search } from "lucide-react";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { templateService } from "../services/templateService";
import { useAuthStore } from "../store/authStore";

const formatDate = (value?: string | null) => {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, selectedClientId } = useAuthStore();
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: templates, isLoading } = useQuery<any[]>({
    queryKey: ["templates"],
    queryFn: templateService.getTemplates,
  });

  const visibleTemplates = useMemo(
    () =>
      (templates || []).filter((template: any) =>
        user?.role === "Employee" && selectedClientId
          ? template.clientId === selectedClientId
          : true,
      ),
    [selectedClientId, templates, user?.role],
  );

  const categoryOptions = useMemo<string[]>(() => {
    const values: string[] = visibleTemplates
      .map((template: any) => String(template.category || ""))
      .filter((value: string) => Boolean(value.trim()));

    return Array.from(new Set<string>(values)).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [visibleTemplates]);

  const typeOptions = useMemo<string[]>(() => {
    const values: string[] = visibleTemplates
      .map((template: any) => String(template.templateType || ""))
      .filter((value: string) => Boolean(value.trim()));

    return Array.from(new Set<string>(values)).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [visibleTemplates]);

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = searchInput.trim().toLowerCase();

    return visibleTemplates.filter((template: any) => {
      const matchesSearch =
        !normalizedSearch ||
        template.templateName?.toLowerCase().includes(normalizedSearch) ||
        template.templateContent?.toLowerCase().includes(normalizedSearch) ||
        template.category?.toLowerCase().includes(normalizedSearch) ||
        template.templateType?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "all" || template.category === categoryFilter;
      const matchesType =
        typeFilter === "all" || template.templateType === typeFilter;

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [categoryFilter, searchInput, typeFilter, visibleTemplates]);

  return (
    <div className="animate-fade-in">
      <section
        style={{
          backgroundColor: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "1rem",
          overflow: "hidden",
          boxShadow: "var(--shadow)",
        }}
      >
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            display: "grid",
            gap: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800 }}>
                Template Directory
              </h2>
              <p style={{ color: "var(--secondary)", marginTop: "0.35rem" }}>
                Search templates, filter by category and type, and quickly edit
                content.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                flexWrap: "nowrap",
              }}
            >
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate("/templates/new")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  width: "auto",
                  flex: "0 0 auto",
                  whiteSpace: "nowrap",
                  padding: "0.45rem 0.8rem",
                  borderRadius: "999px",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                <Plus size={14} />
                Add Template
              </button>

              <div
                style={{
                  flex: "0 0 auto",
                  whiteSpace: "nowrap",
                  padding: "0.45rem 0.8rem",
                  borderRadius: "999px",
                  backgroundColor: "rgba(99, 102, 241, 0.08)",
                  color: "var(--primary)",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              >
                {filteredTemplates.length} showing
              </div>
            </div>
          </div>

          <div
            className="stack-mobile"
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, 1.6fr) minmax(180px, 0.7fr) minmax(180px, 0.7fr)",
              gap: "0.85rem",
            }}
          >
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "0.9rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--secondary)",
                }}
              />
              <input
                type="text"
                placeholder="Search by name, content, category, or type"
                className="form-input"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                style={{ paddingLeft: "2.5rem", marginBottom: 0 }}
              />
            </div>

            <select
              className="form-input"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              style={{ marginBottom: 0 }}
            >
              <option value="all">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              className="form-input"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              style={{ marginBottom: 0 }}
            >
              <option value="all">All template types</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div
            style={{
              padding: "4rem",
              textAlign: "center",
              color: "var(--secondary)",
            }}
          >
            <p>Loading templates...</p>
          </div>
        ) : user?.role === "Employee" && !selectedClientId ? (
          <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              Select a client first
            </h3>
            <p style={{ color: "var(--secondary)" }}>
              Use the header selector to choose which assigned client you want
              to manage.
            </p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div style={{ padding: "3rem 2rem", textAlign: "center" }}>
            <div
              style={{
                width: "52px",
                height: "52px",
                backgroundColor: "var(--background)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                color: "var(--secondary)",
              }}
            >
              <FileText size={24} />
            </div>
            <h3
              style={{
                fontSize: "1.125rem",
                fontWeight: 800,
                marginBottom: "0.5rem",
              }}
            >
              No templates found
            </h3>
            <p style={{ color: "var(--secondary)", marginBottom: "1.5rem" }}>
              Get started by creating your first message template.
            </p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/templates/new")}
              style={{ width: "auto", paddingInline: "0.9rem" }}
            >
              Create First Template
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Actions</th>
                  <th>Template</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template: any) => (
                  <tr key={template.templateId}>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title="Edit template"
                          onClick={() =>
                            navigate(`/templates/edit/${template.templateId}`)
                          }
                        >
                          {/* <Edit size={14} /> */}
                          <Pencil size={14} />
                        </button>
                        {/* <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          title="More options"
                        >
                          <MoreVertical size={14} />
                        </button> */}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        {template.templateName}
                      </div>
                      <div
                        style={{
                          marginTop: "0.2rem",
                          fontSize: "0.75rem",
                          color: "var(--secondary)",
                          maxWidth: "460px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {template.templateContent}
                      </div>
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "0.2rem 0.55rem",
                          borderRadius: "999px",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          backgroundColor: "rgba(99, 102, 241, 0.1)",
                          color: "var(--primary)",
                        }}
                      >
                        {template.category || "General"}
                      </span>
                    </td>
                    <td>{template.templateType || "Unknown"}</td>
                    <td>{formatDate(template.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
