// components/CustomBreadcrumbs.jsx
import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { IoIosHome } from "react-icons/io";
import { HiDotsHorizontal } from "react-icons/hi";
import { MdChevronRight } from "react-icons/md";
import { routePermissions } from '../components/ProtectedRoutes/routePermissions';

export const validRoutes = new Set(
  Object.keys(routePermissions).map((key) => `/${key}`)
);

const COLLAPSE_THRESHOLD = 3;

export default function CustomBreadcrumbs() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const pathnames = location.pathname.split('/').filter(Boolean);

  const allCrumbs = [
    { key: 'home', to: '/', label: 'Home', isHome: true, isValid: true },
    ...pathnames.map((segment, index) => {
      const fullPath = '/' + pathnames.slice(0, index + 1).join('/');
      return {
        key: fullPath,
        to: fullPath,
        label: segment,
        isHome: false,
        isValid: validRoutes.has(fullPath),
      };
    }),
  ];

  const shouldCollapse = !expanded && allCrumbs.length > COLLAPSE_THRESHOLD;

  const visibleCrumbs = shouldCollapse
    ? [allCrumbs[0], { key: '__ellipsis__', isEllipsis: true }, ...allCrumbs.slice(-1)]
    : allCrumbs;

  return (
    <nav
      aria-label="breadcrumb"
      className="flex items-center min-w-0 max-w-full overflow-hidden"
    >
      <ol className="flex items-center min-w-0 max-w-full overflow-hidden flex-nowrap">
        {visibleCrumbs.map((crumb, i) => {
          const isLast = i === visibleCrumbs.length - 1;

          if (crumb.isEllipsis) {
            return (
              <React.Fragment key="__ellipsis__">
                {/* Separator before ellipsis */}
                <li className="flex-shrink-0 flex items-center">
                  <MdChevronRight className="text-slate-400 dark:text-slate-500 text-sm mx-0.5 flex-shrink-0" />
                </li>
                {/* Ellipsis button */}
                <li className="flex-shrink-0 flex items-center">
                  <button
                    onClick={() => setExpanded(true)}
                    title="Show full path"
                    className="flex items-center justify-center px-1.5 h-5 rounded border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors text-[10px] flex-shrink-0"
                  >
                    <HiDotsHorizontal size={12} />
                  </button>
                </li>
                {/* Separator after ellipsis */}
                <li className="flex-shrink-0 flex items-center">
                  <MdChevronRight className="text-slate-400 dark:text-slate-500 text-sm mx-0.5 flex-shrink-0" />
                </li>
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={crumb.key}>
              {/* Separator (not before first item) */}
              {i !== 0 && !visibleCrumbs[i - 1]?.isEllipsis && (
                <li className="flex-shrink-0 flex items-center">
                  <MdChevronRight className="text-slate-400 dark:text-slate-500 text-sm mx-0.5 flex-shrink-0" />
                </li>
              )}

              {/* Crumb */}
              <li className={`flex items-center min-w-0 ${isLast ? 'flex-shrink truncate' : 'flex-shrink-0'}`}>
                {crumb.isValid && !isLast ? (
                  <Link
                    to={crumb.to}
                    title={crumb.label}
                    className="flex items-center gap-1 px-2 h-[22px] rounded text-[11px] sm:text-[12px] font-semibold bg-[var(--primary)] text-[var(--border)] hover:bg-[var(--primary-hover)] transition-colors flex-shrink-0 whitespace-nowrap max-w-[90px] sm:max-w-[130px]"
                  >
                    {crumb.isHome
                      ? <IoIosHome size={13} className="flex-shrink-0" />
                      : <span className="truncate">{crumb.label}</span>
                    }
                  </Link>
                ) : (
                  <span
                    title={crumb.label}
                    className={`flex items-center gap-1 px-2 h-[22px] rounded text-[11px] sm:text-[12px] font-semibold whitespace-nowrap truncate max-w-[90px] sm:max-w-[160px] ${
                      isLast
                        ? 'bg-[var(--primary)] text-[var(--border)] opacity-70'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {crumb.isHome
                      ? <IoIosHome size={13} className="flex-shrink-0" />
                      : crumb.label
                    }
                  </span>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}