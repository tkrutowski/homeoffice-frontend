package net.focik.homeoffice.utils.prints;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Font;
import com.itextpdf.text.pdf.BaseFont;

import java.io.IOException;

public class FontUtil {

    private static final BaseFont bf = getBaseFont();
    public static final Font FONT_12 = new Font(bf, 12, Font.NORMAL);
    public static final Font FONT_12_BOLD = new Font(bf, 12, Font.BOLD);
    public static final Font FONT_10 = new Font(bf, 10, Font.NORMAL);
    public static final Font FONT_10_BOLD = new Font(bf, 10, Font.BOLD);
    public static final Font FONT_8 = new Font(bf, 8, Font.NORMAL);
    public static final Font FONT_EMPTY_SPACE = new Font(bf, 3, Font.NORMAL);
    public static final Font FONT_8_BOLD = new Font(bf, 8, Font.BOLD);

    public static final BaseColor HEADER_COLOR = new BaseColor(215, 215, 215);

    private FontUtil() {
    }

    private static BaseFont getBaseFont() {
        try {
            return BaseFont.createFont("Amiko-Regular.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        } catch (IOException | DocumentException e) {
            e.printStackTrace();
        }
        return null;
    }
}