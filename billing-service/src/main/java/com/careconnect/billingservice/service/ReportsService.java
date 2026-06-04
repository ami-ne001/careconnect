package com.careconnect.billingservice.service;

import com.careconnect.billingservice.dto.MonthlyRevenuePointResponse;
import com.careconnect.billingservice.dto.MonthlyRevenueReportResponse;
import com.careconnect.billingservice.entity.Invoice;
import com.careconnect.billingservice.enums.InvoiceStatus;
import com.careconnect.billingservice.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportsService {

    private static final EnumSet<InvoiceStatus> REVENUE_STATUSES =
            EnumSet.of(InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID);

    private final InvoiceRepository invoiceRepository;

    @Transactional(readOnly = true)
    public MonthlyRevenueReportResponse getMonthlyRevenue(int months, YearMonth endMonth) {
        if (months < 1) {
            months = 6;
        }

        YearMonth startMonth = endMonth.minusMonths(months - 1L);
        LocalDateTime from = startMonth.atDay(1).atStartOfDay();
        LocalDateTime to = endMonth.plusMonths(1).atDay(1).atStartOfDay();

        List<Invoice> invoices = invoiceRepository.findByStatusInAndIssuedAtGreaterThanEqualAndIssuedAtLessThan(
                new ArrayList<>(REVENUE_STATUSES), from, to);

        Map<YearMonth, BigDecimal> revenueByMonth = new HashMap<>();
        for (int i = 0; i < months; i++) {
            revenueByMonth.put(endMonth.minusMonths(months - 1L - i), BigDecimal.ZERO);
        }

        for (Invoice invoice : invoices) {
            if (invoice.getIssuedAt() == null || invoice.getPaidAmount() == null) {
                continue;
            }
            YearMonth ym = YearMonth.from(invoice.getIssuedAt());
            revenueByMonth.computeIfPresent(ym, (k, v) -> v.add(invoice.getPaidAmount()));
        }

        List<MonthlyRevenuePointResponse> points = new ArrayList<>();
        for (int i = 0; i < months; i++) {
            YearMonth ym = endMonth.minusMonths(months - 1L - i);
            String label = ym.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            points.add(MonthlyRevenuePointResponse.builder()
                    .month(label)
                    .revenue(revenueByMonth.getOrDefault(ym, BigDecimal.ZERO))
                    .build());
        }

        return MonthlyRevenueReportResponse.builder().points(points).build();
    }
}
