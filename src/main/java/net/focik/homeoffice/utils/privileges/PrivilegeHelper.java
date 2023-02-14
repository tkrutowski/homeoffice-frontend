package net.focik.homeoffice.utils.privileges;

import java.util.List;

public class PrivilegeHelper {
    public static final String AUTHORITIES = "authorities";
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String HR_EMPLOYEE_DELETE_ALL = "HR_EMPLOYEE_DELETE_ALL";
    public static final String GO_CUSTOMER_READ_ALL = "HR_EMPLOYEE_READ_ALL";
    public static final String GO_CUSTOMER_READ = "HR_EMPLOYEE_READ";
    public static final String GO_CUSTOMER_WRITE_ALL = "HR_EMPLOYEE_WRITE_ALL";
    public static final String GO_CUSTOMER_DELETE_ALL = "GO_CUSTOMER_DELETE_ALL";



    public static final String HR_ADDITION_WRITE_ALL = "HR_ADDITION_WRITE_ALL";
    public static final String HR_ADDITION_READ_ALL = "HR_ADDITION_READ_ALL";
    public static final String HR_ADDITION_READ = "HR_ADDITION_READ";
    public static final String HR_RATE_READ_ALL = "HR_RATE_READ_ALL";
    public static final String HR_RATE_WRITE_ALL = "HR_RATE_WRITE_ALL";
    public static final String HR_SALARIES_READ_ALL = "HR_SALARIES_READ_ALL";
    public static final String HR_SALARIES_READ = "HR_SALARIES_READ";
    public static final String HR_WORKTIME_WRITE_ALL = "HR_WORKTIME_WRITE_ALL";
    public static final String HR_WORKTIME_WRITE = "HR_WORKTIME_WRITE";
    public static final String HR_WORKTIME_READ_ALL = "HR_WORKTIME_READ_ALL";
    public static final String HR_WORKTIME_READ = "HR_WORKTIME_READ";
    public static final String HR_WORKTIME_DELETE_ALL = "HR_WORKTIME_DELETE_ALL";
    public static final String HR_WORKTIME_DELETE = "HR_WORKTIME_DELETE";
    public static final String TASK_CALENDAR_READ_ALL = "TASK_CALENDAR_READ_ALL";
    public static final String TASK_CALENDAR_READ = "TASK_CALENDAR_READ";
    public static final String HR_RATE_DELETE_ALL = "HR_RATE_DELETE_ALL";
    public static final String HR_ADDITION_DELETE_ALL = "HR_ADDITION_DELETE_ALL";
    public static final String HR_ADVANCE_READ_ALL = "HR_ADVANCE_READ_ALL";
    public static final String HR_ADVANCE_READ = "HR_ADVANCE_READ";
    public static final String HR_ADVANCE_WRITE_ALL = "HR_ADDITION_WRITE_ALL";
    public static final String HR_LOAN_READ_ALL = "HR_LOAN_READ_ALL";
    public static final String HR_LOAN_READ = "HR_LOAN_READ";
    public static final String HR_LOAN_WRITE_ALL = "HR_LOAN_WRITE_ALL";
    public static final String GO_INVOICE_DELETE_ALL = "GO_INVOICE_DELETE_ALL";
    public static final String GO_INVOICE_READ_ALL = "GOAHEAD_READ_ALL";
    public static final String GO_INVOICE_WRITE_ALL = "GOAHEAD_WRITE_ALL";

    private PrivilegeHelper() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * @param roles       list of access roles
     * @param searchRoles list of roles to be checked
     * @return true if any role from @roles is found in @searchRoles
     */
    public static boolean dontHaveAccess(List<String> roles, List<String> searchRoles) {
        for (String role : roles) {
            if (searchRoles.contains(role))
                return false;
        }
        return true;
    }
}
